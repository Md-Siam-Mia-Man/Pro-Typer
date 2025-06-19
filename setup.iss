; Inno Setup Script for Pro Typer

[Setup]
AppName=Pro Typer
AppVersion=1.0.0
AppPublisher=Your Md. Siam Mia

DefaultDirName={autopf}\Pro Typer
DefaultGroupName=Pro Typer
OutputBaseFilename=Pro-Typer-Setup-v1.0.0
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
OutputDir=./InstallerOutput
PrivilegesRequired=admin

; UNCOMMENT THE LINE BELOW to use your icon for the installer
SetupIconFile=./assets/icon.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: ".\out\pro-typer-win32-x64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Pro Typer"; Filename: "{app}\pro-typer.exe"
Name: "{autodesktop}\Pro Typer"; Filename: "{app}\pro-typer.exe"; Tasks: desktopicon

[Run]
Filename: "{app}\pro-typer.exe"; Description: "{cm:LaunchProgram,Pro Typer}"; Flags: nowait postinstall skipifsilent