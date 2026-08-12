import { App } from "../../core/app.js";

export const listSheet = {
  getInnerHTML(params) {

    const list = params?.list;

    return `
      <div class="field">   
    
        <input
          class="input"
          placeholder="Name"
        />
  
      </div>
  
  
      <div class="field">
  
        <label>
          Options
        </label>
  
        <label class="switch">
  
          <input type="checkbox">
  
          <span></span>
  
        </label>
  
        <label class="switch">
  
          <input type="checkbox">
  
          <span></span>
  
        </label>
  
      </div>
  
  
      <div class="field">
  
        <label>
          Sort by
        </label>
  
        <div class="radio-group">
          <label class="radio">
            <input type="radio" name="theme" value="light" ${"checked"}>
            <span class="radio__control"></span>
            <span>Manual</span>
          </label>
  
          <label class="radio">
            <input type="radio" name="theme" value="dark">
            <span class="radio__control"></span>
            <span>Alphabetic</span>
          </label>
  
          <label class="radio">
            <input type="radio" name="theme" value="system">
            <span class="radio__control"></span>
            <span>Newest first</span>
          </label>
        
        </div>
  
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

   

  }
}