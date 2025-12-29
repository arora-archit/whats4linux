import SettingButtonDesc from "../../components/SettingButtonDesc"

const GeneralSettingsScreen = () => {
  return (
    <div className="flex flex-col gap-2">
      <SettingButtonDesc title="Start Whatsapp at login" description="" settingtoggle={() => {}} />
      <SettingButtonDesc
        title="Minimize to system tray"
        description="Keep Whatsapp running after closing the application window"
        settingtoggle={() => {}}
      />
    </div>
  )
}

export default GeneralSettingsScreen
