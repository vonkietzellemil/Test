import { App } from "../../core/app.js";

export const settingsPage = {
  getInnerHTML({ title, sections }) {

    return `
      <div class="page-header">
            
        <h2 class="title">${title || "Settings"}</h2>
        
        <div class="searchbar-container">
          <button class="open-sidebar-button button icon-button" onclick="App.pages.pop()">
            ${
              App.pages.stack.length === 1
                ?
                  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M640-80 240-480l400-400 71 71-329 329 329 329-71 71Z"/></svg>'
                :
                  '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-80h280v-560H480v560Z"/></svg>'
            }
          </button>
          <input class="input searchbar" placeholder="Search">
        </div>
      </div>

      <div class="scrollcontainer" style="touch-action: pan-y;">

        ${sections.map(section => `
          <section class="settings-section">

            <h2>${section.title}</h2>

            ${section.items.map(item => `
              <div class="settings-item" 
                  data-setting-id="${item.id}"
                  data-setting-type="${item.type}">

                <div class="setting-info">

                  <span class="setting-icon">
                    ${item.icon ?? ""}
                  </span>

                  <div>
                    <h4>${item.title}</h4>
                    <p>${item.description ?? ""}</p>
                  </div>

                </div>


                <div class="setting-control">

                  ${this.renderControl(item)}

                </div>

              </div>
            `).join("")}

          </section>
        `).join("")}

      </div>
    `;
  },
  renderControl(item) {

    switch(item.type) {

      case "toggle":
        return `

          <label class="switch">

            <input type="checkbox" data-id="${item.id}" ${item.value ? "checked" : ""}>

            <span></span>

          </label>
        `;


      case "select":
        return `
          <select 
            class="select"
            data-id="${item.id}"
          >
            
            ${item.options.map(option => `
              <option 
                value="${option}"
                ${option === item.value ? "selected" : ""}
              >
                ${option}
              </option>
            `).join("")}

          </select>
        `;


      case "link":
        return `
          <span class="setting-link">
            ›
          </span>
        `;


      default:
        return "";
    }
  },

  init({page, params}) {

    page.querySelectorAll(
      ".setting-control input[type='checkbox']"
    )
    .forEach(toggle => {

      toggle.addEventListener("change", e => {

        const id = e.target.dataset.id;

        console.log(
          "Changed",
          id,
          e.target.checked
        );


        // save
        localStorage.setItem(
          id,
          e.target.checked
        );

      });

    });



    page.querySelectorAll(
      ".setting-control select"
    )
    .forEach(select => {


      select.addEventListener("change", e => {

        const id = e.target.dataset.id;


        localStorage.setItem(
          id,
          e.target.value
        );


      });


    });



    page.querySelectorAll(
      ".settings-item[data-setting-type='link']"
    )
    .forEach(item => {


      item.addEventListener("click", () => {


        const id = item.dataset.settingId;


        const setting = params.sections
          .flatMap(s => s.items)
          .find(i => i.id === id);


        setting?.action?.();


      });


    });


  }
}