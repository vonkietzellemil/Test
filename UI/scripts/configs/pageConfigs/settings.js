import { App } from "../../core/app.js";

export const settings = {
  root: {
    template: "settings",
    getParams() {
      return {
        title: "Settings",
        sections: [
          {
            title: "General",
            items: [
              {
                id: "preferences",
                icon: "🌙",
                title: "Preferences",
                description: "Set preferences for this App",
                type: "link",
                action() {
                  App.pages.newPage({ config: App.pages.configs.settings.preferences });
                }
              },
              {
                id: "language",
                icon: "🌍",
                title: "Language",
                description: "Choose your app language",
                type: "select",
                options: [
                  "English",
                  "German",
                  "French"
                ],
              }
            ]
          },

          {
            title: "Notifications",
            items: [
              {
                id: "pushNotifications",
                icon: "🔔",
                title: "Push notifications",
                description: "Receive updates from the app",
                type: "toggle",
              }
            ]
          },

          {
            title: "Account",
            items: [
              {
                id: "profile",
                icon: "👤",
                title: "Profile",
                description: "Manage your profile",
                type: "link",
                action() {
                  console.log("Open profile");
                }
              }
            ]
          }
        ]
      }
    }
  },

  preferences: {
    template: "settings",
    getParams() {
      return {
        title: "Preferences",
        sections: [
          {
            title: "Appearance",
            items: [
              {
                id: "darkMode",
                icon: "🌙",
                title: "Dark mode",
                description: "Use a darker color theme",
                type: "toggle",
              },
            ]
          },

          {
            title: "Notifications",
            items: [
              {
                id: "pushNotifications",
                icon: "🔔",
                title: "Push notifications",
                description: "Receive updates from the app",
                type: "toggle",
              }
            ]
          },

        ]
      }
    }
  },

  manageData: {
    template: "settings",
    getParams() {
      return {
        sections: [
          {
            title: "Manage your Data",
            items: [
              {
                id: "darkMode",
                icon: "🌙",
                title: "Export Data",
                description: "",
                type: "toggle",
              },
              {
                id: "language",
                icon: "🌍",
                title: "Import Data",
                description: "",
                type: "select",
                options: [
                  "English",
                  "German",
                  "French"
                ],
              }
            ]
          },

          {
            title: "Delete Everything",
            items: [
              {
                id: "profile",
                icon: "👤",
                title: "Delete my Data",
                description: "",
                type: "link",
                action() {
                  console.log("Open profile");
                }
              }
            ]
          }
        ]
      }
    }
  },
};