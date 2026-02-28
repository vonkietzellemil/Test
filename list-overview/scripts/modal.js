/* --- modal template 1 ---
  modalTitle = "";
  modalContent = 
  modalBtns = exampleBtn("id", "text");
  createModal();
*/
const modalContainer = document.getElementById("modalContainer");

let modalTitle = "";
let modalContent = "";
let modalBtns = "";

// modalContent
function getEditNameInput(id, placeholder) {
  return `<input id="${id}" class="edit-title-input" type="text" placeholder="${placeholder}">`;
}

function getEditRowContentInput(id, placeholder) {
  return `<textarea id="${id}" class="edit-content-input" placeholder="${placeholder}"></textarea>`;
}

// modalBtns
function getStandardBtn(id, content) {
  return `
    <button id="${id}" class="standard-btn" type="button">
      ${content}
    </button>
  `;
}

// template
function createModal() {
  modalContainer.innerHTML = `
    <div class="modal">   
      <div class="modal-card" role="dialog">
        <button id="closeModalBtn" class="close-modal-btn" type="button">
          <img class="close-modal-icon" src="images/plus.svg">
        </button>   

        <h1 class="modal-title">${modalTitle}</h1>

        <div id="modalContent">${modalContent}</div>

        <div id="modalBtns">${modalBtns}</div>

      </div>
    </div>
  `
};

function deleteModal() {
  modalContainer.innerHTML = "";
};

/* 



<!-- Edit Row Popup Menu -->
      <div id="editRowModal" class="modal hidden">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="newListModalTitle">
          <h1 class="modal-title">Bearbeite den Eintrag</h1>
          <input id="editRowTitleInput" class="edit-title-input" type="text" placeholder="Eintrag umbenennen">
          <textarea id="editRowContentInput" placeholder="Füge eine Notiz hinzu..."></textarea>
        

          <button id="closeModalBtn" class="close-modal-btn" type="button">
            <img class="close-modal-icon" src="images/plus.svg">
          </button>
          <button id="saveChangesToRowBtn" class="standard-btn" type="button">Speichern</button>
        </div>
      </div>






<!-- Create List Popup Menu -->
      <div id="modal" class="modal hidden">
        <div class="modal-backdrop" id="newListModalBackdrop"></div>

        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="newListModalTitle">
          <h2 id="newListModalTitle" class="modal-title">Liste erstellen</h2>

          <label class="label-for-list-name">
            Name:
            <input id="newListNameInput" class="title-input" type="text" placeholder="z.B. Einkauf, ToDo..." />
          </label>

          <label class="label-for-list-options">
            <p>Optionen:</p>
            <div class="list-options-container">
              <label class="list-option-label">
                <input id="enableCounterCheckbox" class="list-option-checkbox" type="checkbox">
                Zähler
              </label>
            </div>
          </label>

          <button id="" class="close-modal-btn" type="button">
            <img class="close-modal-icon" src="images/plus.svg">
          </button>
          <button id="createNewListBtn" class="standard-btn" type="button">Erstellen</button>
        </div>
      </div>



<!-- Edit List Popup Menu -->
    <div id="editListModal" class="modal hidden">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="editListModalTitle">
        <h1 class="modal-title">Liste umbenennen</h1>
        <input id="editListTitleInput" class="edit-title-input" type="text" placeholder="Benenne deine Liste">

        <button id="closeEditListModalBtn" class="close-popup-btn" type="button">
          <img class="close-popup-icon" src="images/plus.svg">
        </button>
        <button id="saveChangesToListBtn" class="standard-btn" type="button">Speichern</button>
      </div>
    </div>
*/