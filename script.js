const notesContainer = document.getElementById("app");
const addNoteButton = notesContainer.querySelector(".add-note");

// 1. Semak dan reset nota jika sudah bertukar hari (Daily Reset)
checkDailyReset();

// 2. Minta kebenaran pelayar untuk paparkan notifikasi apabila aplikasi mula dibuka
document.addEventListener("DOMContentLoaded", () => {
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
});

getNotes().forEach((note) => {
    const noteCard = createNoteElement(note.id, note.content, note.isDone);
    notesContainer.insertBefore(noteCard, addNoteButton);
});

addNoteButton.addEventListener("click", () => addNote());

function getNotes() {
    return JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
}

function saveNotes(notes) {
    localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
}

// Fungsi untuk semak sama ada hari sudah bertukar
function checkDailyReset() {
    const today = new Date().toDateString(); // Dapatkan tarikh hari ini
    const savedDate = localStorage.getItem("stickynotes-date");

    if (savedDate !== today) {
        // Jika tarikh berbeza (hari baru), kosongkan nota semalam dan kemas kini tarikh
        localStorage.removeItem("stickynotes-notes");
        localStorage.setItem("stickynotes-date", today);
    }
}

function createNoteElement(id, content, isDone) {
    const card = document.createElement("div");
    card.classList.add("note-card");

    const element = document.createElement("textarea");
    element.classList.add("note");
    element.value = content;
    element.placeholder = "Empty Sticky Note";

    if (isDone) {
        element.classList.add("done");
    }

    // Simpan teks automatik apabila pengguna menaip
    element.addEventListener("change", () => {
        updateNoteContent(id, element.value);
    });

    // Double-click untuk tukar status hijau (Done) / Toggle
    element.addEventListener("dblclick", () => {
        toggleNoteDone(id, element);
    });

    // Butang pangkah (X) untuk padam nota
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-btn");
    deleteButton.innerHTML = "&times;";
    deleteButton.title = "Delete Note";

    deleteButton.addEventListener("click", () => {
        const doDelete = confirm("Are you sure you wish to delete this sticky note?");
        if (doDelete) {
            deleteNote(id, card);
        }
    });

    card.appendChild(element);
    card.appendChild(deleteButton);

    return card;
}

function addNote() {
    const notes = getNotes();
    const noteObject = {
        id: Math.floor(Math.random() * 100000),
        content: "",
        isDone: false
    };

    const noteCard = createNoteElement(noteObject.id, noteObject.content, noteObject.isDone);
    notesContainer.insertBefore(noteCard, addNoteButton);

    notes.push(noteObject);
    saveNotes(notes);
}

function updateNoteContent(id, newContent) {
    const notes = getNotes();
    const targetNote = notes.find((note) => note.id == id);
    if (targetNote) {
        targetNote.content = newContent;
        saveNotes(notes);
    }
}

function toggleNoteDone(id, element) {
    const notes = getNotes();
    const targetNote = notes.find((note) => note.id == id);

    if (targetNote) {
        targetNote.isDone = !targetNote.isDone;
        saveNotes(notes);

        if (targetNote.isDone) {
            element.classList.add("done");
        } else {
            element.classList.remove("done");
        }
    }
}

function deleteNote(id, card) {
    const notes = getNotes().filter((note) => note.id != id);
    saveNotes(notes);
    notesContainer.removeChild(card);
}

// 3. Sistem Pemasa Semakan Setiap 1 Jam untuk Notifikasi Peringatan (Dalam Bahasa Inggeris)
setInterval(() => {
    const notes = getNotes();
    const pendingNotes = notes.filter((note) => !note.isDone && note.content.trim() !== "");

    if (pendingNotes.length > 0) {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Tracey Daily Jotter Reminder 🔔", {
                body: `Hey! You still have ${pendingNotes.length} pending task(s) to complete today. Let's get it done!`,
                icon: "logo_tracey.jpg"
            });
        }
    }
}, 3600000); // 3600000 ms = 1 jam