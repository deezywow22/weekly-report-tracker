// ==== FIREBASE CONFIG ====
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentView = "active";

function addTask() {
  const input = document.getElementById("taskInput");
  const category = document.getElementById("category").value;

  if (input.value.trim() === "") return;

  db.collection("tasks").add({
    text: input.value,
    category: category,
    done: false,
    created: new Date()
  });

  input.value = "";
}

function loadTasks() {
  db.collection("tasks").onSnapshot(snapshot => {
    const list = document.getElementById("taskList");
    list.innerHTML = "";

    snapshot.forEach(doc => {
      const task = doc.data();
      if ((currentView === "active" && !task.done) ||
          (currentView === "completed" && task.done)) {

        const li = document.createElement("li");
        li.innerHTML = `
          <input type="checkbox" ${task.done ? "checked" : ""}
          onclick="toggleTask('${doc.id}', ${task.done})">
          ${task.text} (${task.category})
        `;
        list.appendChild(li);
      }
    });
  });
}

function toggleTask(id, doneStatus) {
  db.collection("tasks").doc(id).update({
    done: !doneStatus
  });
}

function showActive() {
  currentView = "active";
  loadTasks();
}

function showCompleted() {
  currentView = "completed";
  loadTasks();
}

function sendWeeklyReport() {
  db.collection("tasks")
    .where("done", "==", true)
    .get()
    .then(snapshot => {
      let completedTasks = "";
      snapshot.forEach(doc => {
        completedTasks += "- " + doc.data().text + "\n";
      });

      emailjs.send("service_xuvj3fl", "template_tvzypob", {
        tasks: completedTasks
      });

      alert("Weekly report sent!");
    });
}
}

loadTasks();

