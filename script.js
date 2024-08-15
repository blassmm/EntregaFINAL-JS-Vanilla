window.onload = () => {
  actualizarInterfaz();
};

let tareas = JSON.parse(localStorage.getItem("listaTareas")) || [];

class Tareas {
  constructor(nombre, descripcion, dificultad, finalizada = false) {
    this.nombre = nombre;
    this.descripcion = descripcion;
    this.dificultad = dificultad;
    this.finalizada = finalizada;
    this.id = Date.now() + Math.random(); // Aca con el id me ayude con un tuto
  }
}

const guardarLocal = (key, value) => {
  localStorage.setItem(key, value);
};

const botonAdd = document.getElementById("addTarea");
botonAdd.onclick = () => agregarTareas();

const botonVerTareas = document.getElementById("verCompletadas");
botonVerTareas.onclick = () => tareasCompletadas("Alertar");

const botonClearTareas = document.getElementById("borrarTodo");
botonClearTareas.onclick = () => {
  localStorage.clear(); // Borro el localStorage
  tareas = []; // y tmb Borro en memoria
  actualizarInterfaz();
};

const botonOcultarCompletadas = document.getElementById("ocultarCompletadas");
botonOcultarCompletadas.onclick = () => {
  guardarLocal("listaTareas", JSON.stringify(tareas));
  tareasCompletadas("Check");
};

/*-----------------------------FUNCIONES----------------------------------------------*/
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
function actualizarInterfaz() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  tareas.forEach((_, index) => {
    agregarCards(index); // No uso el primer param
  });
}

function agregarTareas() {
  const nombre = prompt("Ingrese el nombre de la tarea:");
  const descripcion = prompt("Ingrese la descripcion:");
  const dificultad = parseInt(prompt("Ingrese la dificultad:"));

  const nuevaTarea = new Tareas(nombre, descripcion, dificultad);

  const tareaExiste = tareas.some((el) => el.nombre === nuevaTarea.nombre); // Chequeamos por mismo nombre, que la tarea no exista

  if (!tareaExiste) {
    tareas.push(nuevaTarea);
    agregarCards(tareas.indexOf(nuevaTarea)); // Pasamos solo la nueva tarea en lugar de todo el array

    guardarLocal("listaTareas", JSON.stringify(tareas));
  } else {
    alert("La tarea ya existe en la lista.");
  }
}

function agregarCards(index) {
  const container = document.getElementById("container");
  const numElements = container.children.length;

  if (numElements !== 10) {             // Máximo 10 tareas activas a la vez
    const card = document.createElement("div");
    card.className = "card";
    card.id = tareas[index].id;        // Asignamos el id único a la card

    const nombre = document.createElement("h3");
    nombre.className = "nombre__cards";
    nombre.innerText = tareas[index].nombre;

    const descripcion = document.createElement("h3");
    descripcion.innerText = tareas[index].descripcion;
    descripcion.className = "descripcion__cards";

    const dificultad = document.createElement("p");
    dificultad.innerText = `Dificultad = ${tareas[index].dificultad}`;

    const botonUpdate = document.createElement("button");
    botonUpdate.style.backgroundColor = tareas[index].finalizada ? "green" : "gray"; 
    botonUpdate.id = `boton__finalizar${index}`;
    botonUpdate.innerText = tareas[index].finalizada ? "Finalizada" : "Finalizar";

    botonUpdate.onclick = () => updateBoton(index);

    card.append(nombre, descripcion, dificultad, botonUpdate);
    container.append(card);

  } else {
    alert("Alcanzaste el máximo de Tareas activas");
  }
}

function updateBoton(indexInh) {
  // Cambia el estado de la tarea
  tareas[indexInh].finalizada = !tareas[indexInh].finalizada;

  // Actualiza el botón correspondiente
  const botonUpdate2 = document.getElementById(`boton__finalizar${indexInh}`);

  if (tareas[indexInh].finalizada) {
    botonUpdate2.innerText = "Finalizada";
    botonUpdate2.style.backgroundColor = "green";
  } else {
    botonUpdate2.innerText = "Finalizar";
    botonUpdate2.style.backgroundColor = "gray";
  }

  guardarLocal("listaTareas", JSON.stringify(tareas));
}

function tareasCompletadas(action) {
  let tareasFinalizadas = tareas.filter((tarea) => tarea.finalizada);

  if (action === "Alertar") {
    if (tareasFinalizadas.length > 0) {
      const nombres = tareasFinalizadas
        .map((tarea) => `* ${tarea.nombre},`)
        .join("\n");
      alert(`Ya finalizaste las siguientes tareas:\n\n${nombres}`);
    } else {
      alert("No finalizaste ninguna tarea");
    }
  } else if (action === "Check") {
    const container = document.getElementById("container");

    tareasFinalizadas.forEach((tarea) => {
      let tareaElement = document.getElementById(tarea.id);

      if (tareaElement) {
        container.removeChild(tareaElement);
      }
    });
  }
}