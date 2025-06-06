# ZettelLink - Obsidian Plugin

An Obsidian plugin that guides users towards fundamental Zettelkasten principles through subtle assistance rather than strict enforcement.

## Features

### 1. Atomic Note Guidance (Zettel Creator)
- **Command**: `ZettelLink: Create new Zettel`
- **Ribbon Icon**: Quick access button in the left sidebar
- **Template Selection**: Choose from three types of Zettel notes:
  - **Fleeting Note**: For quick thoughts and ideas
  - **Literature Note**: For notes from sources with proper attribution
  - **Permanent Note**: For atomic, well-developed ideas

### 2. Orphaned Notes Detection
- **Sidebar Pane**: Dedicated "Orphaned Notes" view
- **Smart Detection**: Automatically finds notes with no incoming links
- **Quick Actions**: 
  - Click to open note
  - "Link" button to add connection prompts
  - Right-click context menu with additional options
- **Ignore Function**: Mark notes to exclude from orphaned detection

## Installation

### Manual Installation
1. Copy the plugin files to your Obsidian vault's plugins folder:
   ```
   VaultFolder/.obsidian/plugins/zettellink/
   ```
2. Enable the plugin in Obsidian Settings > Community Plugins

### Development Installation
1. Clone this repository to your vault's plugins folder
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the plugin
4. Enable the plugin in Obsidian

## Usage

### Creating a New Zettel
1. Use the ribbon icon or command palette (`Ctrl/Cmd + P`)
2. Search for "ZettelLink: Create new Zettel"
3. Select your desired template type
4. The note will be created with:
   - Auto-generated unique ID (timestamp-based)
   - Pre-filled template content
   - Filename ready for you to customize

### Finding Orphaned Notes
1. Open the "Orphaned Notes" pane via command palette
2. Review the list of notes without incoming links
3. Click on any note to open it
4. Use the "Link" button to add connection prompts
5. Right-click for additional options

## Settings

### ID Format
- **Timestamp**: `YYYYMMDDHHMMSS` format (default)
- **UUID**: Universal unique identifier

### Templates
Customize the template content for each note type:
- **Fleeting Note Template**: Quick capture format
- **Literature Note Template**: Source attribution format  
- **Permanent Note Template**: Atomic idea format

### Orphaned Notes
- Enable/disable the orphaned notes pane
- Customize the frontmatter field for ignoring notes
- Set exclusion rules

## Zettelkasten Principles

This plugin is designed around core Zettelkasten principles:

### Atomicity
Each note should contain one clear, focused idea. The templates encourage this by:
- Providing structure for single concepts
- Including prompts for connections
- Encouraging concise, focused writing

### Connectivity
Notes gain value through connections. The plugin supports this by:
- Detecting orphaned notes
- Providing easy linking mechanisms
- Encouraging review and connection-building

### Thinking Tool
Beyond just storage, this system encourages:
- Active thinking through template prompts
- Regular review of orphaned content
- Building knowledge networks over time

## Template Variables

Use these variables in your custom templates:
- `{{ID}}`: Auto-generated unique identifier
- `{{DATE}}`: Current date (YYYY-MM-DD format)
- `{{TIME}}`: Current time (HH:MM:SS format)

## Development

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Version Management
```bash
npm run version
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, feature requests, or questions, please open an issue on the GitHub repository.

---

*This plugin respects Obsidian's core design philosophy while gently guiding users towards effective Zettelkasten practices.*

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/U7U81FTOBP)
