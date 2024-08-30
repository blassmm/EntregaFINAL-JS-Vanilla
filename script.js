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

const recomendaciones = document.getElementById("recomendaciones");
recomendaciones.onclick = () => {
  fetch("recomendaciones.json")
    .then((response) => response.json())
    .then((data) => {
      setTimeout(() => {
        const nombres = data.map((el) => el.nombre).join(", ");

        Swal.fire({
          title: "Tareas Recomendadas",
          text: `El dev te recomienda: ${nombres}`,
          icon: "success",
          confirmButtonText: "Aceptar",
        });
      }, 1300);
    })
    .catch((error) => {
      console.error("Error al cargar el archivo JSON:", error);
      Swal.fire({
        title: "Error",
        text: "No se pudo cargar el archivo JSON.",
        icon: "error",
        confirmButtonText: "Aceptar",
      });
    });
};

/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------*/

function actualizarInterfaz() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  tareas.forEach((_, index) => {
    agregarCards(index); // No uso el primer param
  });
}

async function agregarTareas() {
  try {
    // -----------------------------------------------
    const { value: nombre } = await Swal.fire({
      title: "Ingrese el nombre de la tarea:",
      input: "text",
      inputPlaceholder: "Nombre de la tarea",
      confirmButtonText: "Siguiente",
      showCancelButton: true,
    });

    if (!nombre) return;

    // -----------------------------------------------
    const { value: descripcion } = await Swal.fire({
      title: "Ingrese la descripción:",
      input: "textarea",
      inputPlaceholder: "Descripción de la tarea",
      confirmButtonText: "Siguiente",
      showCancelButton: true,
    });

    if (descripcion === null) return;

    // -----------------------------------------------
    const { value: dificultad } = await Swal.fire({
      title: "Ingrese la dificultad:",
      input: "number",
      inputPlaceholder: "Dificultad (número)",
      confirmButtonText: "Agregar tarea",
      showCancelButton: true,
    });

    if (dificultad === null || isNaN(dificultad)) return;
    // -----------------------------------------------

    const nuevaTarea = new Tareas(nombre, descripcion, parseInt(dificultad));

    const tareaExiste = tareas.some((el) => el.nombre === nuevaTarea.nombre);

    if (tareaExiste) {
      Swal.fire({
        title: "Tarea ya existe",
        text: "La tarea ya existe en la lista",
        icon: "error",
      });
      return;
    }

    // Verifica el número de tareas activas
    const container = document.getElementById("container");
    const numElements = container.children.length;

    if (numElements >= 4) {
      // Máximo 4 tareas activas a la vez
      Swal.fire({
        icon: "warning",
        title: "¡Alcanzaste el máximo de Tareas activas!",
        text: "Solo puedes tener un máximo de 4 tareas activas al mismo tiempo.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    // -----------------------------------------------

    tareas.push(nuevaTarea);
    agregarCards(tareas.indexOf(nuevaTarea)); // Pasamos solo la nueva tarea en lugar de todo el array
    guardarLocal("listaTareas", JSON.stringify(tareas));

    Swal.fire({
      title: "Tarea agregada",
      text: "La tarea se ha añadido correctamente",
      icon: "success",
    });
  } catch (error) {
    Swal.fire({
      title: "Error",
      text: "Ocurrió un error al agregar la tarea",
      icon: "error",
    });
  }
}

function agregarCards(index) {
  const container = document.getElementById("container");
  const numElements = container.children.length;

  if (numElements >= 4) return;
  // -----------------------------------------------

  const card = document.createElement("div");
  card.className = "card";
  card.id = tareas[index].id; // Asignamos el id único a la card

  const nombre = document.createElement("h3");
  nombre.className = "nombre__cards";
  nombre.innerText = tareas[index].nombre;

  const descripcion = document.createElement("h3");
  descripcion.innerText = tareas[index].descripcion;
  descripcion.className = "descripcion__cards";

  const dificultad = document.createElement("p");
  dificultad.innerText = `Dificultad = ${tareas[index].dificultad}`;

  const botonUpdate = document.createElement("button");
  botonUpdate.style.backgroundColor = tareas[index].finalizada
    ? "green"
    : "gray";
  botonUpdate.id = `boton__finalizar${index}`;
  botonUpdate.innerText = tareas[index].finalizada ? "Finalizada" : "Finalizar";

  botonUpdate.onclick = () => updateBoton(index);

  card.append(nombre, descripcion, dificultad, botonUpdate);
  container.append(card);
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

async function tareasCompletadas(action) {
  let tareasFinalizadas = tareas.filter((tarea) => tarea.finalizada);

  if (action === "Alertar") {
    if (tareasFinalizadas.length > 0) {
      const nombres = tareasFinalizadas.map((tarea) => `"${tarea.nombre}"`)

      await Swal.fire({
        title: 'Tareas Finalizadas',
        text: `Ya finalizaste las siguientes tareas: ${nombres}`,
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
    } else {
      await Swal.fire({
        title: 'Sin Tareas Finalizadas',
        text: 'Todavia no finalizaste ninguna tarea',
        icon: 'info',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#3085d6'
      });
    }
  } else if (action === "Check") {
    const container = document.getElementById("container");

    tareasFinalizadas.forEach((tarea) => {
      let tareaElement = document.getElementById(tarea.id)

      if (tareaElement) {
        container.removeChild(tareaElement)
      }
    });
  }
}
