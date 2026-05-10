



# För att starta servern:
```
cd server 
node --watch server
```

http://localhost:5555/

För att kunna göra ändringer i både client och server (i två olika terminaler samtidigt): 
```
cd client 
npm run watch-build
```

# Git hanteringen. 

För 
```
git add . 
git status 
git commit -m "Text"
git push -u origin main 
```

```
git pull origin main
```
#



# Skapa en ny repository 
```
git init
git commit -m "first commit"
git branch -M main
git remote add origin https://länk
git config --global user.name "UserName"
git config --global user.email "email@example.com"
git push -u origin main
```



# Dokumentation IFF
## GA 2026

---

### Server-setup: Express, HTTP och Socket.io

```js
const express = require("express");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { createServer } = require("http");
const { Server } = require("socket.io");

const server = createServer(app);
const io = new Server(server);
```

Socket.io behöver en HTTP-server. Därför skapas först en HTTP-server med `createServer(app)` som tar Express-appen som argument. Sedan skapas en Socket.io-instans (`io`) som binds till den HTTP-servern. På så sätt delar både Express-routes och Socket.io samma port och server.

***

### Delad session mellan Express och Socket.io

```js
const sessionMiddleware = session({
  secret: process.env.PASS,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  }
});

app.use(sessionMiddleware);
io.engine.use(sessionMiddleware);
```

Sessionen konfigureras en gång och appliceras på både Express (`app.use`) och Socket.io (`io.engine.use`). Utan `io.engine.use` skulle Socket.io-hanterare inte ha tillgång till `req.session`, och man skulle inte kunna veta vem som är inloggad inne i socket-events. `httpOnly: true` hindrar JavaScript i webbläsaren från att läsa cookie-värdet, vilket skyddar mot XSS-attacker. `maxAge` sätter att sessionen lever i 24 timmar.

***

### Databaskoppling med pg Pool

```js
// index.js
const { Pool } = require('pg');
const pool = new Pool();

module.exports = {
    query: (text, params) => pool.query(text, params)
}
```

`pg`-biblioteket används för att kommunicera med PostgreSQL. `Pool` hanterar flera databasanslutningar parallellt, vilket är nödvändigt i en server som tar emot många förfrågningar samtidigt. `new Pool()` hämtar automatiskt anslutningsuppgifter från miljövariabler (`PGUSER`, `PGPASSWORD`, `PGDATABASE` osv.). Modulen exporterar bara en `query`-funktion, vilket håller databasanropet enkelt och konsekvent i resten av koden.

***

### Indatavalidering och säkerhet

```js
const { body } = require('express-validator');

function validatData(data) {
  return body(data).trim().escape()
}

app.post("/register", [
  validatData('email'),
  validatData('password'),
  validatData('userName')
], async (req, res) => { ... })
```

Innan indata från användaren bearbetas saniteras den med `express-validator`. `.trim()` tar bort onödiga mellanslag och `.escape()` omvandlar HTML-specialtecken (som `<`, `>`, `"`) till ofarliga tecken. Det skyddar mot XSS-attacker där en angripare annars hade kunnat injicera skadlig HTML eller JavaScript via ett formulärfält.

***

### Registrering av ny användare

```js
app.post("/register", [...], async (req, res) => {
  const password = bcrypt.hashSync(pw, saltRounds)

  const registered = await db.query(
    `INSERT INTO users (user_name, user_email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING user_id, user_name, user_email;`,
    [userName, email, password]
  )

  req.session.userId = user_id;
  req.session.userName = user_name;
  req.session.loggedIn = true;

  return res.redirect("/")
})
```

Lösenordet hashas med `bcrypt` innan det sparas i databasen. Det innebär att klartext-lösenordet aldrig lagras. Om databasen läcker kan angriparen ändå inte läsa lösenorden direkt. `saltRounds: 10` styr hur beräkningskrävande hashningen är. Parametriserade queries (`$1, $2, $3`) skyddar mot SQL-injection. Efter lyckad registrering skapas direkt en session och användaren redirectas till startsidan utan att behöva logga in separat.

***

### Inloggning och lösenordskontroll

```js
app.post("/login", [...], async (req, res) => {
  const aUser = await db.query(
    "SELECT user_id, user_name, password_hash FROM users WHERE user_email = $1;",
    [email]
  )

  const checkedPw = bcrypt.compareSync(pw, password_hash)
  if (checkedPw) {
    req.session.userId = user_id;
    req.session.loggedIn = true;
    return res.redirect("/")
  } else {
    res.send("Wrong password or email")
  }
})
```

`bcrypt.compareSync` jämför det inskrivna lösenordet mot det hashade lösenordet i databasen. Bcrypt hanterar själv att extrahera salt och hasha på rätt sätt. Man behöver inte lagra saltet separat. Returnerar `true` eller `false`. Vid lyckad inloggning sparas användarens id och namn i sessionen, vilket gör dem tillgängliga i alla efterföljande requests och socket-events.

***

### Session-kontroll och utloggning

```js
app.get("/session", (req, res) => {
  if (req.session.userId) {
    res.json({ status: "Session", session: req.session })
  } else {
    res.json({ status: "No session" })
  }
})

app.get("/logout", (req, res) => {
  req.session.destroy()
  res.redirect("/")
})
```

`/session`-endpointen används av React-klienten vid sidladdning för att avgöra om användaren redan är inloggad, utan att behöva logga in igen samt använda värden i applikationen. `/logout` förstör sessionen helt med `req.session.destroy()`, vilket gör att alla sessionsdata raderas server-side och cookien slutar gälla.

***

### Socket.io-anslutning och sessionstillgång

```js
io.on("connection", (socket) => {
  const theSession = socket.request.session

  socket.on("someEvent", async () => {
    const userId = theSession.userId;
    // ...
  })
})
```

När en klient ansluter via Socket.io körs `io.on("connection")`. Inuti denna callback lagras sessionen i `theSession` en gång — eftersom sessionen är delad med Express (se tidigare avsnitt) innehåller den `userId`, `userName` och `loggedIn`. Alla socket-events inne i `connection`-blocket har sedan tillgång till `theSession` via closure, utan att behöva läsa om sessionen för varje event.

***

### Felhantering i Socket.io

```js
function emitSocketError(socket, message) {
  socket.emit("error", typeof message === "string" ? message : "Something went wrong. Please try again.");
}
```

En hjälpfunktion som skickar ett error-event tillbaka till den specifika klienten. Klientens React-kod lyssnar på `"error"`-eventet och visar ett `alert()`. Kontrollen `typeof message === "string"` är ett skydd så att man inte råkar skicka ett Error-objekt eller undefined till klienten. Isf skickas ett generellt felmeddelande istället.

***

### Join/Leave-meddelanden i chatten

```js
async function emitJoindLeftRoom(roomId, message, userId) {
  if (!roomId) return;

  const creLeaveMsg = await db.query(`
    WITH inserted AS (
      INSERT INTO msgs (room_id, msg_content, msg_user_id)
      VALUES ($1, $2, $3)
      RETURNING msg_id, room_id, msg_content, msg_user_id, created_at, edited_at
    )
    SELECT inserted.*, u.user_name
    FROM inserted
    JOIN users u ON inserted.msg_user_id = u.user_id;
  `, [roomId, message, "1"])

  io.to(`room:${roomId}`).emit("sendMsg", { ...creLeaveMsg.rows[0] })
}
```

När en användare går med i eller lämnar ett rum skapas ett systemmeddelande och sparas i databasen med `msg_user_id = 1` (systemanvändaren). SQL:en använder en `WITH`-sats för att både infoga och direkt hämta tillbaka raden tillsammans med `user_name` i en enda query. Meddelandet skickas sedan till alla i rummet via `io.to("room:X").emit(...)`, som riktar sig till hela Socket.io-rummet, inte bara en socket.

***

### Skapa rum

```js
socket.on("creRoom", async (reqRoom) => {
  for (const u of emails) {
    const userFound = await db.query(
      "SELECT user_id FROM users WHERE user_email = $1", [u]
    )
    if (userFound.rows.length === 0) {
      return socket.emit("crtdRoom", { status: "Error", error: `User ${u} is not registered.` })
    }
    toAddUsers.push(userFound.rows[0].user_id)
  }

  const room = await db.query(
    `INSERT INTO rooms (room_name, admin_id, room_description)
     VALUES ($1, $2, $3) RETURNING room_id;`,
    [roomName, adminId, roomDesc]
  )

  for (const u of toAddUsers) {
    await db.query(
      `INSERT INTO room_members (room_id, user_id) VALUES ($1, $2)
       ON CONFLICT (room_id, user_id) DO NOTHING`,
      [room_id, u]
    )
  }

  socket.emit("crtdRoom", { status: "Success", room_id: room_id })
})
```

Servern tar emot en lista med e-postadresser och validerar att varje e-post finns registrerad i databasen innan rummet skapas. Om någon e-post saknas avbryts hela operationen med ett felmeddelande. `ON CONFLICT DO NOTHING` i members-inserten gör att man inte kraschar om någon redan är med i rummet. Skaparen (`adminId`) läggs alltid till i listan automatiskt.

***

### Gå med i rum

```js
socket.on("room:join", async (roomId) => {
  const roomFound = await db.query(
    `SELECT room_id, room_name, room_description, admin_id FROM rooms WHERE room_id = $1`,
    [roomId]
  )
  if (roomFound.rows.length === 0) {
    return socket.emit("roomInfo", { status: false, error: "Room was not found!" })
  }

  const userFound = await db.query(
    `SELECT rm.joined_at FROM room_members rm
     JOIN users u ON rm.user_id = u.user_id
     WHERE rm.room_id = $1 AND u.user_id = $2`,
    [roomId, userId]
  )
  if (userFound.rows.length === 0) {
    return socket.emit("roomInfo", { status: false, error: "You are not a member of this room!" })
  }

  socket.join(`room:${roomId}`)
  socket.emit("roomInfo", { status: true, roomInfo: roomInfo })
  await emitJoindLeftRoom(roomId, `${theSession.userName} connected to the room.`, theSession.userId)
})
```

Servern gör två kontroller: först att rummet existerar, sedan att användaren faktiskt är medlem. Om båda stämmer anropas `socket.join("room:X")` som lägger till den specifika socket-anslutningen i ett namngivet Socket.io-rum. Det gör att `io.to("room:X").emit(...)` sedan når alla anslutna klienter i det rummet.

***

### Hämta gamla meddelanden

```js
socket.on("getOldMsgs", async (roomId) => {
  const oldMsgs_res = await db.query(`
    SELECT m.msg_id, m.room_id, m.msg_content, m.created_at, m.edited_at, m.msg_user_id,
           u.user_name, u.user_email
    FROM msgs m
    JOIN users u ON m.msg_user_id = u.user_id
    WHERE m.room_id = $1
    ORDER BY m.created_at ASC;
  `, [roomId])

  socket.emit("oldMsgs", oldMsgs_res.rows)
})
```

Hämtar alla befintliga meddelanden för ett rum sorterade i tidsordning och skickar dem direkt tillbaka till den anslutande klienten med `socket.emit` (bara till denna klient, inte till hela rummet). JOIN mot `users`-tabellen gör att `user_name` finns med i varje meddelande direkt.

***

### Skicka meddelande i realtid

```js
socket.on("sendMsg", async (msg) => {
  const dataBaseMsg = await db.query(`
    WITH inserted AS (
      INSERT INTO msgs (room_id, msg_content, msg_user_id)
      VALUES ($1, $2, $3)
      RETURNING msg_id, room_id, msg_content, msg_user_id, created_at, edited_at
    )
    SELECT inserted.*, u.user_name
    FROM inserted
    JOIN users u ON inserted.msg_user_id = u.user_id;
  `, [msg.roomId, msg.text, userId])

  io.to(`room:${msg.roomId}`).emit("sendMsg", dataBaseMsg.rows[0]);
})
```

Meddelandet sparas i databasen och broadcastas sedan till alla i rummet med `io.to(...).emit(...)` men inte till avsändaren. Queryn (`WITH inserted AS (...)`) sparar och hämtar tillbaka raden med user_name i ett enda databasanrop istället för två separata.

***

### Redigera meddelande

```js
socket.on("editMsg", async (msg) => {
  const newMsgQ = await db.query(`
    UPDATE msgs
      SET msg_content = $1, edited_at = CURRENT_TIMESTAMP
      WHERE msg_id = $2 AND msg_user_id = $3
    RETURNING msg_id, msg_content, edited_at;
  `, [msg.text, msg.msgId, userId])

  if (newMsgQ.rows.length === 0) return;

  io.to(`room:${msg.roomId}`).emit("editedMsg", { msg_id, msg_content, edited_at });
})
```

`AND msg_user_id = $3` i SQL:en är säkerhetsvillkoret — det garanterar att bara den ursprungliga avsändaren kan redigera meddelandet, oavsett vad klienten skickar. Om ingen rad uppdateras (t.ex. fel användare) returnerar `RETURNING` noll rader och servern gör inget. Den uppdaterade datan broadcastas till rummet.

***

### Radera meddelande

```js
socket.on("deleteMsg", async (msg) => {
  await db.query(`
    DELETE FROM msgs
      WHERE msg_id = $1
      AND (
        msg_user_id = $2
        OR
        (SELECT admin_id FROM rooms WHERE room_id = $3) = $2
      );
  `, [msg.msgId, userId, msg.roomId])

  io.to(`room:${msg.roomId}`).emit("deletedMsg", msg.msgId);
})
```

SQL:en innehåller en dubbel behörighetskontroll direkt i queryn: antingen är det den egna avsändarens meddelande (`msg_user_id = $2`) eller så är användaren admin i rummet (subquery som hämtar `admin_id`). Det betyder att raderingen aldrig kan lyckas för obehöriga, oavsett vad klienten skickar. Alla i rummet får `deletedMsg`-eventet med meddelandets id.

***

### Lämna rum och frånkoppling

```js
socket.on("leave-room", async (roomId) => {
  await emitJoindLeftRoom(roomId, `${theSession.userName} left the room.`, theSession.userId)
  socket.leave(`room:${roomId}`)
})

socket.on("disconnecting", async (reason) => {
  for (const room of socket.rooms) {
    if (room.startsWith("room:")) {
      const roomId = room.split(":")[1];
      await emitJoindLeftRoom(roomId, `${theSession.userName} left the room because of: ${reason}.`, theSession.userId)
    }
  }
})
```

Det finns två sätt att lämna ett rum: antingen via det explicita `"leave-room"`-eventet (användaren trycker på krysset), eller via `"disconnecting"` som triggas automatiskt när websocket-anslutningen bryts (t.ex. om användaren stänger fliken). `disconnecting` används istället för `disconnect` för att `socket.rooms` fortfarande innehåller alla rum vid det tillfället — efter `disconnect` är listan redan tömd.

***

### Hämta och transformera rumsdata

```js
socket.on("reqMyRooms", async () => {
  const rooms_result = await db.query(`
    SELECT r.room_id, r.room_name, ..., u.user_id as member_id, u.user_name as member_name, ...
    FROM rooms r
    JOIN room_members rm ON r.room_id = rm.room_id
    JOIN users u ON rm.user_id = u.user_id
    JOIN users a ON r.admin_id = a.user_id
    WHERE r.room_id IN (SELECT room_id FROM room_members WHERE user_id = $1)
  `, [userId])

  const roomsMap = {}
  rooms_result.rows.forEach(row => {
    if (!roomsMap[row.room_id]) {
      roomsMap[row.room_id] = { room_id: row.room_id, room_name: row.room_name, admin: {...}, members: [] }
    }
    roomsMap[row.room_id].members.push({ user_id: row.member_id, user_name: row.member_name, ... })
  })

  socket.emit("resMyRooms", Object.values(roomsMap))
})
```

SQL-queryn returnerar en rad per rumsmedlem, vilket betyder att ett rum med tre medlemmar ger tre rader med samma rumsinformation men olika member-data. Server-sidan transformerar detta till ett objekt (`roomsMap`) indexerat på `room_id`, där varje rum har en `members`-array. Slutligen konverteras objektet till en array med `Object.values()` innan det skickas till klienten.

***

### Uppdatera rum

```js
socket.on("updateRoom", async (req) => {
  const checkAdmin = await db.query(`SELECT admin_id FROM rooms WHERE room_id = $1`, [roomId])
  const isAdmin = (checkAdmin.rows[0]?.admin_id === userId)

  if (isAdmin) {
    await db.query(`UPDATE rooms SET room_name = $2, admin_id = (...), room_description = $4 WHERE room_id = $1`, [...])

    await db.query(`DELETE FROM room_members WHERE room_id = $1 AND user_id NOT IN (SELECT user_id FROM users WHERE user_email = ANY($2))`, [roomId, members])

    await db.query(`INSERT INTO room_members (room_id, user_id) SELECT $1, user_id FROM users WHERE user_email = ANY($2) ON CONFLICT (room_id, user_id) DO NOTHING`, [roomId, members])
  }

  socket.emit("newRoom", { newRoom: {...}, newMembers: [...] })
})
```

Uppdateringen hanterar rumsmedlemmar i två steg: 
Först raderas alla som inte längre ska vara med, sedan läggs nya till. `ANY($2)` i SQL:en tar emot en JavaScript-array och matchar mot alla e-postadresser i listan. Admin-emailen pushas alltid in i members-listan innan sync, så att adminen aldrig kan ta bort sig själv av misstag.

***

### Session-kontroll vid appstart (React)

```jsx
// App.jsx
export default function App() {
  const [activeTap, setActiveTap] = useState(0)
  const [mySession, setMySession] = useState(null)

  useEffect(() => {
    fetch("/session")
      .then(res => res.json())
      .then(res => {
        if (res.status === "Session") {
          setMySession(res.session);
          setActiveTap(1)
        } else {
          setActiveTap(0)
        }
      })
  }, []);

  return activeTap === 0 ? <Auth /> : <Home />
}
```

Vid sidladdning gör `App` ett HTTP-anrop till `/session` för att kolla om servern redan har en aktiv session. Beroende på svaret sätts `activeTap` till `0` (visa inloggning) eller `1` (visa appen). Det gör att sidan "känner igen" inloggade användare utan att de behöver logga in igen vid varje sidladdning. `useEffect` med tom dependency-array `[]` körs bara en gång, vid mount.

***

### Socket.io-anslutning och routing i Home (React)

```jsx
// Home.jsx
import { io } from 'socket.io-client'
const socketIo = io('http://localhost:5555')

export default function Home({ mySession, activeTap, setActiveTap }) {
  return (<>
    <Header ... />
    <div>
      {activeTap === 21 && <Profile />}
      {activeTap === 22 && <DashBoard socketIo={socketIo} />}
      {activeTap === 24 && <Auth />}
      {joinedRoom && <Room socketIo={socketIo} />}
      {activeTap < 10 && <RoomSearch socketIo={socketIo} />}
    </div>
  </>)
}
```

`socketIo`-instansen skapas utanför komponenten så att den inte återskapas vid re-renders. Den skickas sedan ner som prop till alla komponenter som behöver realtidskommunikation. Routing sköts med en enkel `activeTap`-siffra istället för ett router-bibliotek. Olika nummer representerar olika vyer (21 = Profil, 22 = Dashboard, 11 = Rum, osv).

***

### Skapa och gå med i rum (React)

```jsx
// RoomSearch.jsx
const handleCreateRoom = () => {
  socketIo.emit("creRoom", { roomName, roomDescription, users: members })
  socketIo.once("crtdRoom", (room) => {
    if (room.status === "Error") {
      alert(room.error)
    } else {
      handelJoinRoom(room.room_id);
    }
  })
}

function handelJoinRoom(roomId) {
  socketIo.emit("room:join", roomId);
  socketIo.once("roomInfo", (statusInfo) => {
    if (statusInfo.status) {
      setRoomInfo(statusInfo.roomInfo)
      setJoinedRoom(true)
    } else {
      alert(statusInfo.error)
    }
  })
}
```

`.once()` används istället för `.on()` här. Det innebär att lyssnaren bara triggar en gång och sedan tar bort sig själv automatiskt. Det är viktigt för request/response-mönstret: annars skulle varje gång användaren skapade ett rum läggas till en ny lyssnare som ackumuleras. Efter lyckad join sparas rumsinfo i state och `joinedRoom` sätts till `true`, vilket gör att `Home` byter vy till chatten.

***

### Realtidschat och socket-lyssnare (React)

```jsx
// room.jsx
useEffect(() => {
  socketIo.emit("getOldMsgs", roomInfo.room_id)

  socketIo.once("oldMsgs", (oldMsgs) => { setMsgs(oldMsgs) })
  socketIo.on("sendMsg", (msg) => { setMsgs((prev) => [...prev, msg]) })
  socketIo.on("editedMsg", (newMsg) => {
    setMsgs((prev) => prev.map((msg) =>
      msg.msg_id === newMsg.msg_id ? { ...msg, ...newMsg } : msg
    ))
  })
  socketIo.on("deletedMsg", (deletedMsgId) => {
    setMsgs((prev) => prev.filter((msg) => msg.msg_id !== deletedMsgId))
  })

  return () => {
    socketIo.off("sendMsg")
    socketIo.off("editedMsg")
    socketIo.off("deletedMsg")
  }
}, [socketIo, roomInfo.room_id])
```

`useEffect` lyssnar på alla meddelande-events. `setMsgs((prev) => [...])` används med callback-formen för att alltid arbeta mot det senaste state-värdet, vilket undviker stale closure-buggar. Cleanup-funktionen (`return () => { socketIo.off(...) }`) körs när komponenten unmountas och tar bort lyssnarna, annars hade nya lyssnare lagts till vid varje mount.

***

### Meddelandekomponent med redigering och radering (React)

```jsx
// msg.jsx
export default function Msg({ m, i, msgs, mySession, socketIo }) {
  const [editing, setEditing] = useState(false)
  const lastMsgSender = i > 0 && msgs[i - 1]?.msg_user_id === msgs[i].msg_user_id;

  const handleEnter = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      socketIo.emit("editMsg", { msgId: m.msg_id, roomId: m.room_id, text: newText })
      setEditing(false)
    }
  }

  const deleteMsg = () => {
    socketIo.emit("deleteMsg", { msgId: m.msg_id, roomId: m.room_id })
  }
}
```

`lastMsgSender` jämför om föregående meddelande i listan har samma avsändare — om det stämmer visas inte avsändarens namn igen, vilket ger ett chattgränssnitt likt moderna appar. Enter-tangenten skickar meddelandet men `Shift+Enter` gör det inte, vilket låter användaren skriva radbrytningar. Edit- och delete-knappar visas bara om `m.msg_user_id === mySession.userId`.

***

### Dashboard och rumsredigering (React)

```jsx
// DashBoard.jsx
useEffect(() => {
  socketIo.emit("reqMyRooms", "")
  socketIo.on("resMyRooms", (resMyRooms) => { setMyRooms(resMyRooms) })
  socketIo.on("removedAccess", (Id) => {
    setMyRooms(prevRooms => prevRooms.filter(room => room.room_id !== Id))
  })
  return () => {
    socketIo.off("resMyRooms");
    socketIo.off("removedAccess");
  }
}, [])
```

```jsx
// RoomEditor.jsx
function roomUpdater() {
  socketIo.emit("updateRoom", { roomId: room.room_id, roomName, roomDescription, roomAdminEmail, members })
}

function removeRoomAccess() {
  socketIo.emit("removeRoomAccess", room.room_id)
}
```

`DashBoard` begär alla rum vid mount och lyssnar kontinuerligt på `"resMyRooms"`. `"removedAccess"`-eventet uppdaterar listan direkt i state när ett rum tas bort, utan att behöva be om hela listan igen. `RoomEditor` är ett formulär per rum som hanterar uppdatering av namn, beskrivning, admin och medlemmar.

***

### AddMembers – e-postinmatning med taggar (React)

```jsx
// AddMembers.jsx
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (createValue.trim()) {
      handleAddMember(createValue.trim());
    }
  } else if (e.key === 'Backspace' && !createValue && members.length > 0) {
    handleRemoveMember(members[members.length - 1]);
  }
};
```

Komponenten hanterar en lista av e-postadresser. Enter lägger till den inskrivna adressen som en "tagg" och rensar inputfältet. Backspace när inputfältet är tomt tar bort den senast tillagda adressen — ett beteende som känns naturligt och liknar moderna tag-inputs. `members`-arrayen och `setMembers` lyfts upp till föräldrakomponenten så att rummets formulär kan använda listan vid submit.

***

### Header och navigering (React)

```jsx
// Header.jsx
<div
  onMouseEnter={() => setNavOpen(true)}
  onMouseLeave={() => setNavOpen(false)}
>
  {navOpen && (
    <nav onClick={() => setNavOpen(false)}>
      <button onClick={() => setActiveTap(21)}>Profile</button>
      <button onClick={() => setActiveTap(22)}>Dash board</button>
      <button onClick={() => setActiveTap(24)}>Log out</button>
    </nav>
  )}
</div>
```

Navigeringsmenyn styrs av `navOpen`-state som sätts med `onMouseEnter`/`onMouseLeave`. Klick på ett menyalternativ byter `activeTap` och stänger menyn. `setActiveTap` skickas ner från `App` via `Home` till `Header`, vilket gör att hela appens vy kan bytas från headern. Menyn renderas villkorligt med `{navOpen && ...}` istället för att visas/döljas med CSS.

***

### Title-komponent och lämna rum (React)

```jsx
// title.jsx
function exitRoom() {
  if (!isRoom) {
    setActiveTap(1)
  }
  if (isRoom) {
    socketIo.emit("leave-room", roomId);
    setActiveTap(1)
    setJoinedRoom(false)
  }
}
```

`Title` är en återanvändbar header-komponent för vyer. `isRoom`-propen styr om krysset ska lämna ett chattrum (emit socket-event + återställa state) eller bara navigera tillbaka till startsidan. Socket-eventet `"leave-room"` triggar servern att skicka ett systemmeddelande till rummet och ta bort socketen från Socket.io-rummet.