document.addEventListener('DOMContentLoaded', () => {

  const loginModal = document.querySelector('#loginModal');
  const openModalBtn = document.querySelector('#openModalBtn');
  const closeModalBtn = document.querySelector('#closeModalBtn');

  const arbitroModal = document.querySelector('#arbitroModal');
  const closeArbitroModalBtn = document.querySelector('#closeArbitroModalBtn');

  const actaModal = document.querySelector('#actaModal');
  const closeActaModalBtn = document.querySelector('#closeActaModalBtn');

  const btnRoleArbitro = document.querySelector('#btnRoleArbitro');
  const btnRoleCoordinador = document.querySelector('#btnRoleCoordinador');
  const btnRoleAdmin = document.querySelector('#btnRoleAdmin');

  const btnStartMatch = document.querySelector('#btnStartMatch');
  const btnResetData = document.querySelector('#btnResetData');
  const clockDisplay = document.querySelector('#clockDisplay');
  const periodBadge = document.querySelector('#periodBadge');

  const scoreEq1 = document.querySelector('#scoreEq1');
  const scoreEq2 = document.querySelector('#scoreEq2');
  const bgGolesEq1 = document.querySelector('#bgGolesEq1');
  const bgGolesEq2 = document.querySelector('#bgGolesEq2');

  const selectPeriodo = document.querySelector('#selectPeriodo');
  const selectEquipo = document.querySelector('#selectEquipo');
  const selectTipoEvento = document.querySelector('#selectTipoEvento');
  
  const standardPlayerGroup = document.querySelector('#standardPlayerGroup');
  const substitutionGroup = document.querySelector('#substitutionGroup');
  const inputJugador = document.querySelector('#inputJugador');
  const inputJugadorSale = document.querySelector('#inputJugadorSale');
  const inputJugadorEntra = document.querySelector('#inputJugadorEntra');

  const btnRegisterEvent = document.querySelector('#btnRegisterEvent');
  const timelineList = document.querySelector('#timelineList');
  const btnGenerateActa = document.querySelector('#btnGenerateActa');
  const actaContent = document.querySelector('#actaContent');
  const btnPrintActa = document.querySelector('#btnPrintActa');

  let timerInterval = null;
  let secondsElapsed = 0;
  let matchStatus = 'NO_INICIADO';
  let goalsTeam1 = 0;
  let goalsTeam2 = 0;
  let matchEvents = JSON.parse(localStorage.getItem('futbolero_eventos')) ?? [];

  // Inicializar estado guardado en localStorage al cargar
  recalcularGoles();
  renderizar();

  if (openModalBtn) {
    openModalBtn.addEventListener('click', () => {
      loginModal.classList.add('active');
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      loginModal.classList.remove('active');
    });
  }

  if (btnRoleArbitro) {
    btnRoleArbitro.addEventListener('click', () => {
      loginModal.classList.remove('active');
      arbitroModal.classList.add('active');
      renderizar();
    });
  }

  if (btnRoleCoordinador) {
    btnRoleCoordinador.addEventListener('click', () => {
      alert('Ingresando como Coordinador...');
      loginModal.classList.remove('active');
    });
  }

  if (btnRoleAdmin) {
    btnRoleAdmin.addEventListener('click', () => {
      alert('Ingresando como Administrador...');
      loginModal.classList.remove('active');
    });
  }

  if (closeArbitroModalBtn) {
    closeArbitroModalBtn.addEventListener('click', () => {
      arbitroModal.classList.remove('active');
    });
  }

  if (closeActaModalBtn) {
    closeActaModalBtn.addEventListener('click', () => {
      actaModal.classList.remove('active');
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (loginModal) loginModal.classList.remove('active');
      if (arbitroModal) arbitroModal.classList.remove('active');
      if (actaModal) actaModal.classList.remove('active');
    }
  });

  // Alternar vista de inputs para sustituciones o eventos estándar
  if (selectTipoEvento) {
    selectTipoEvento.addEventListener('change', () => {
      if (selectTipoEvento.value === 'Sustitución') {
        standardPlayerGroup.classList.add('hidden');
        substitutionGroup.classList.remove('hidden');
      } else {
        standardPlayerGroup.classList.remove('hidden');
        substitutionGroup.classList.add('hidden');
      }
    });
  }

  // Cronómetro del partido
  if (btnStartMatch) {
    btnStartMatch.addEventListener('click', () => {
      if (matchStatus === 'NO_INICIADO') {
        matchStatus = '1_TIEMPO';
        periodBadge.textContent = "1° TIEMPO";
        btnStartMatch.textContent = "Pausar / Descanso";
        iniciarCronometro();
      } else if (matchStatus === '1_TIEMPO') {
        matchStatus = 'DESCANSO';
        periodBadge.textContent = "DESCANSO";
        btnStartMatch.textContent = "Iniciar 2° Tiempo";
        detenerCronometro();
      } else if (matchStatus === 'DESCANSO') {
        matchStatus = '2_TIEMPO';
        periodBadge.textContent = "2° TIEMPO";
        btnStartMatch.textContent = "Finalizar Partido";
        iniciarCronometro();
      } else if (matchStatus === '2_TIEMPO') {
        matchStatus = 'FINALIZADO';
        periodBadge.textContent = "FINALIZADO";
        btnStartMatch.textContent = "Partido Concluido";
        btnStartMatch.disabled = true;
        detenerCronometro();
      }
    });
  }

  function iniciarCronometro() {
    detenerCronometro();
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
      const secs = String(secondsElapsed % 60).padStart(2, '0');
      if (clockDisplay) clockDisplay.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function detenerCronometro() {
    if (timerInterval) clearInterval(timerInterval);
  }

  // Reiniciar datos del partido
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm('¿Desea reiniciar el cronómetro y los eventos registrados?')) {
        detenerCronometro();
        secondsElapsed = 0;
        matchStatus = 'NO_INICIADO';
        matchEvents = [];
        goalsTeam1 = 0;
        goalsTeam2 = 0;

        if (clockDisplay) clockDisplay.textContent = '00:00';
        if (periodBadge) periodBadge.textContent = 'NO INICIADO';
        if (btnStartMatch) {
          btnStartMatch.textContent = 'Iniciar Partido';
          btnStartMatch.disabled = false;
        }

        localStorage.removeItem('futbolero_eventos');
        actualizarMarcador();
        renderizar();
      }
    });
  }

  // Registro de eventos (Goles, tarjetas, faltas, cambios)
  if (btnRegisterEvent) {
    btnRegisterEvent.addEventListener('click', (e) => {
      e.preventDefault();

      const periodo = selectPeriodo.value;
      const equipo = selectEquipo.value;
      const tipo = selectTipoEvento.value;
      const minute = clockDisplay ? clockDisplay.textContent : '00:00';
      let detalle = '';

      if (tipo === 'Sustitución') {
        const sale = inputJugadorSale.value.trim();
        const entra = inputJugadorEntra.value.trim();

        if (!sale || !entra) {
          alert('Por favor ingrese ambos jugadores para la sustitución.');
          return;
        }
        detalle = `Sale: ${sale} ➔ Entra: ${entra}`;
      } else {
        const jugador = inputJugador.value.trim();

        if (!jugador) {
          alert('Por favor ingrese el nombre del jugador autor o involucrado.');
          inputJugador.focus();
          return;
        }
        detalle = jugador;
      }

      const nuevoEvento = {
        id: Date.now(),
        minute,
        periodo,
        equipo,
        tipo,
        detalle
      };

      matchEvents.push(nuevoEvento);

      inputJugador.value = '';
      inputJugadorSale.value = '';
      inputJugadorEntra.value = '';

      guardarPersistencia();
      recalcularGoles();
      renderizar();
    });
  }

  function guardarPersistencia() {
    localStorage.setItem('futbolero_eventos', JSON.stringify(matchEvents));
  }

  function recalcularGoles() {
    goalsTeam1 = matchEvents.filter(ev => ev.tipo === 'Gol' && ev.equipo === 'EQUIPO 1').length;
    goalsTeam2 = matchEvents.filter(ev => ev.tipo === 'Gol' && ev.equipo === 'EQUIPO 2').length;
    actualizarMarcador();
  }

  function actualizarMarcador() {
    if (scoreEq1) scoreEq1.textContent = goalsTeam1;
    if (scoreEq2) scoreEq2.textContent = goalsTeam2;
    if (bgGolesEq1) bgGolesEq1.textContent = goalsTeam1;
    if (bgGolesEq2) bgGolesEq2.textContent = goalsTeam2;
  }

  // Renderizar la cronología de eventos con opción de eliminar
  function renderizar() {
    if (!timelineList) return;

    timelineList.replaceChildren();

    if (matchEvents.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.classList.add('timeline-empty');
      emptyDiv.textContent = 'No hay eventos registrados en este partido.';
      timelineList.append(emptyDiv);
      return;
    }

    matchEvents.forEach(evt => {
      let tagClass = 'tag-falta';
      if (evt.tipo === 'Gol') tagClass = 'tag-gol';
      else if (evt.tipo === 'Tarjeta Amarilla') tagClass = 'tag-amarilla';
      else if (evt.tipo === 'Tarjeta Roja') tagClass = 'tag-roja';
      else if (evt.tipo === 'Sustitución') tagClass = 'tag-cambio';

      const item = document.createElement('div');
      item.classList.add('timeline-item');

      const infoDiv = document.createElement('div');
      infoDiv.classList.add('event-info');

      const timeSpan = document.createElement('span');
      timeSpan.classList.add('event-time');
      timeSpan.textContent = `${evt.minute}'`;

      const tagSpan = document.createElement('span');
      tagSpan.classList.add('event-tag', tagClass);
      tagSpan.textContent = evt.tipo;

      const descSpan = document.createElement('span');
      descSpan.textContent = `[${evt.equipo}] ${evt.detalle} (${evt.periodo})`;

      infoDiv.append(timeSpan, tagSpan, descSpan);

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('btn-delete-event');
      deleteBtn.textContent = '✕';
      deleteBtn.title = 'Eliminar evento';
      deleteBtn.addEventListener('click', () => {
        matchEvents = matchEvents.filter(e => e.id !== evt.id);
        guardarPersistencia();
        recalcularGoles();
        renderizar();
      });

      item.append(infoDiv, deleteBtn);
      timelineList.append(item);
    });
  }

  // Generar Acta Digital
  if (btnGenerateActa) {
    btnGenerateActa.addEventListener('click', () => {
      if (matchEvents.length === 0) {
        alert('Debe registrar al menos un evento para generar el acta.');
        return;
      }

      let html = `<p><strong>Estado del Partido:</strong> ${periodBadge.textContent}</p>`;
      html += `<p><strong>Marcador Final:</strong> EQUIPO 1 (${goalsTeam1}) - (${goalsTeam2}) EQUIPO 2</p>`;
      html += `<hr style="border-color: #333; margin: 10px 0;">`;
      html += `<p><strong>Eventos Registrados:</strong></p><ul style="padding-left: 20px; margin-top: 5px;">`;

      matchEvents.forEach(ev => {
        html += `<li><strong>${ev.minute}' [${ev.periodo}]</strong> - ${ev.equipo}: <em>${ev.tipo}</em> (${ev.detalle})</li>`;
      });

      html += `</ul>`;
      actaContent.innerHTML = html;
      actaModal.classList.add('active');
    });
  }

  if (btnPrintActa) {
    btnPrintActa.addEventListener('click', () => {
      window.print();
    });
  }

});
