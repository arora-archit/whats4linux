import { create } from "zustand"
import { GetSettings, SaveSettings } from "../../wailsjs/go/api/Api"

interface AppSettings {
  theme: "light" | "dark"
  readReceipts: boolean
  blockUnknown: boolean
  disableLinkPreviews: boolean
  // TODO: to add more persistent settings here later
}

interface AppSettingsStore extends AppSettings {
  loaded: boolean

  loadSettings: () => Promise<void>
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
  toggleTheme: () => Promise<void>
}

export const useAppSettingsStore = create<AppSettingsStore>((set, get) => ({
  theme: "light",
  readReceipts: true,
  blockUnknown: false,
  disableLinkPreviews: false,
  loaded: false,

  loadSettings: async () => {
    try {
      const settings = await GetSettings()
      set({
        theme: settings.theme ?? "light",
        readReceipts: settings.readReceipts ?? true,
        blockUnknown: settings.blockUnknown ?? false,
        disableLinkPreviews: settings.disableLinkPreviews ?? false,
        loaded: true,
      })
    } catch (err) {
      console.error("Failed to load settings:", err)
      set({ loaded: true })
    }
  },

  updateSetting: async (key, value) => {
    set({ [key]: value })
    try {
      const current = get()
      await SaveSettings({
        theme: current.theme,
        readReceipts: current.readReceipts,
        blockUnknown: current.blockUnknown,
        disableLinkPreviews: current.disableLinkPreviews,
      })
    } catch (err) {
      console.error("Failed to save setting:", err)
    }
  },

  toggleTheme: async () => {
    const newTheme = get().theme === "light" ? "dark" : "light"
    await get().updateSetting("theme", newTheme)
  },
}))
