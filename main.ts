import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf, ItemView, Menu } from 'obsidian';

interface ZettelLinkSettings {
	idFormat: 'timestamp' | 'uuid';
	appendId: boolean;
	fleetingTemplate: string;
	literatureTemplate: string;
	permanentTemplate: string;
	enableOrphanedPane: boolean;
	ignoreFrontmatter: string;
	showRibbonIcon: boolean;
}

const DEFAULT_SETTINGS: ZettelLinkSettings = {
	idFormat: 'timestamp',
	appendId: false,
	fleetingTemplate: `---
id: {{ID}}
zettel_type: fleeting
---

# Quick thought on {{DATE}}

- {{TIME}} [[ ]]`,
	literatureTemplate: `---
id: {{ID}}
zettel_type: literature
source: "" # e.g., "Sönke Ahrens - How to Take Smart Notes"
page: "" # e.g., "p. 42"
keywords: [] # e.g., "Zettelkasten, Note-taking"
---

# From Source: [[Placeholder Title]]

**Summary (in my own words):**


**Key Points:**
-

**Connections/Thoughts:**
- [[ ]]`,
	permanentTemplate: `---
id: {{ID}}
zettel_type: permanent
---

# My Zettel Title

This is my single, atomic idea, written in my own words.

---
**Connections:**
- [[ ]] # Link to existing Zettels, literature notes, or fleeting notes
- [[ ]]

**Source (if applicable):** [[Placeholder Source Title]]`,
	enableOrphanedPane: true,
	ignoreFrontmatter: 'zettel_ignore',
	showRibbonIcon: true
};

export default class ZettelLinkPlugin extends Plugin {
	settings: ZettelLinkSettings;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Add ribbon icon
		if (this.settings.showRibbonIcon) {
			const ribbonIconEl = this.addRibbonIcon('file-plus', 'Create new Zettel', (evt: MouseEvent) => {
				this.createNewZettel();
			});
			ribbonIconEl.addClass('zettellink-ribbon-class');
		}

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'create-new-zettel',
			name: 'Create new Zettel',
			callback: () => {
				this.createNewZettel();
			}
		});

		// Add command to open orphaned notes view
		this.addCommand({
			id: 'open-orphaned-notes-view',
			name: 'Open Orphaned Notes view',
			callback: () => {
				this.activateOrphanedNotesView();
			}
		});

		// Register view for orphaned notes
		this.registerView(
			ORPHANED_NOTES_VIEW_TYPE,
			(leaf: WorkspaceLeaf) => new OrphanedNotesView(leaf, this)
		);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new ZettelLinkSettingTab(this.app, this));
	}

	onunload(): void {
		// Cleanup
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	createNewZettel(): void {
		new ZettelTemplateModal(this.app, this).open();
	}

	async activateOrphanedNotesView(): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(ORPHANED_NOTES_VIEW_TYPE);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0];
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for it
			leaf = workspace.getRightLeaf(false);
			await leaf.setViewState({ type: ORPHANED_NOTES_VIEW_TYPE, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		workspace.revealLeaf(leaf);
	}

	generateId(): string {
		if (this.settings.idFormat === 'timestamp') {
			const now = new Date();
			return now.getFullYear().toString() +
				   String(now.getMonth() + 1).padStart(2, '0') +
				   String(now.getDate()).padStart(2, '0') +
				   String(now.getHours()).padStart(2, '0') +
				   String(now.getMinutes()).padStart(2, '0') +
				   String(now.getSeconds()).padStart(2, '0');
		} else {
			// Generate simple UUID-like string
			return 'xxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function(c) {
				const r = Math.random() * 16 | 0;
				const v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		}
	}

	async createZettelFromTemplate(templateType: 'fleeting' | 'literature' | 'permanent'): Promise<void> {
		const id = this.generateId();
		const now = new Date();
		const date = now.toISOString().split('T')[0];
		const time = now.toTimeString().split(' ')[0];

		let template = '';
		
		switch (templateType) {
			case 'fleeting':
				template = this.settings.fleetingTemplate;
				break;
			case 'literature':
				template = this.settings.literatureTemplate;
				break;
			case 'permanent':
				template = this.settings.permanentTemplate;
				break;
		}

		// Replace template variables
		template = template
			.replace(/\{\{ID\}\}/g, id)
			.replace(/\{\{DATE\}\}/g, date)
			.replace(/\{\{TIME\}\}/g, time);

		const filename = this.settings.appendId ? 
			`Enter your Zettel title here-${id}.md` : 
			`${id}-Enter your Zettel title here.md`;

		try {
			const file = await this.app.vault.create(filename, template);
			const leaf = this.app.workspace.getUnpinnedLeaf();
			await leaf.openFile(file);
			
			// Focus on the title to encourage user to replace it
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view) {
				const editor = view.editor;
				// Find the title line and select the placeholder text
				const content = editor.getValue();
				const titleMatch = content.match(/# (.+)/);
				if (titleMatch) {
					const titleLine = content.split('\n').findIndex((line: string) => line.includes(titleMatch[1]));
					if (titleLine !== -1) {
						editor.setSelection(
							{ line: titleLine, ch: 2 },
							{ line: titleLine, ch: 2 + titleMatch[1].length }
						);
					}
				}
			}
		} catch (error) {
			new Notice('Error creating Zettel: ' + error.message);
		}
	}
}

class ZettelTemplateModal extends Modal {
	plugin: ZettelLinkPlugin;

	constructor(app: App, plugin: ZettelLinkPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onOpen(): void {
		const {contentEl} = this;
		contentEl.createEl("h2", { text: "Create new Zettel" });

		const buttonContainer = contentEl.createDiv({ cls: "zettel-template-buttons" });

		const fleetingBtn = buttonContainer.createEl("button", { 
			text: "Fleeting Note (Quick Capture)",
			cls: "mod-cta zettel-template-btn"
		});
		fleetingBtn.onclick = () => {
			this.plugin.createZettelFromTemplate('fleeting');
			this.close();
		};

		const literatureBtn = buttonContainer.createEl("button", { 
			text: "Literature Note (From Source)",
			cls: "mod-cta zettel-template-btn"
		});
		literatureBtn.onclick = () => {
			this.plugin.createZettelFromTemplate('literature');
			this.close();
		};

		const permanentBtn = buttonContainer.createEl("button", { 
			text: "Permanent Note (Zettel)",
			cls: "mod-cta zettel-template-btn"
		});
		permanentBtn.onclick = () => {
			this.plugin.createZettelFromTemplate('permanent');
			this.close();
		};
	}

	onClose(): void {
		const {contentEl} = this;
		contentEl.empty();
	}
}

const ORPHANED_NOTES_VIEW_TYPE = "orphaned-notes-view";

class OrphanedNotesView extends ItemView {
	plugin: ZettelLinkPlugin;
	private refreshButton: HTMLElement;

	constructor(leaf: WorkspaceLeaf, plugin: ZettelLinkPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return ORPHANED_NOTES_VIEW_TYPE;
	}

	getDisplayText(): string {
		return "Orphaned Notes";
	}

	getIcon(): string {
		return "unlink";
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		
		const headerDiv = container.createEl("div", { cls: "nav-header" });
		headerDiv.createEl("h4", { text: "ZettelLink: Orphaned Notes" });
		
		this.refreshButton = headerDiv.createEl("button", { 
			text: "↻",
			cls: "clickable-icon nav-action-button",
			attr: { title: "Refresh orphaned notes" }
		});
		this.refreshButton.onclick = () => this.refresh();

		await this.refresh();
	}

	async refresh(): Promise<void> {
		const container = this.containerEl.children[1];
		const listContainer = container.querySelector('.orphaned-notes-list') as HTMLElement || 
			container.createEl("div", { cls: "orphaned-notes-list" });
		
		listContainer.empty();

		const orphanedNotes = await this.findOrphanedNotes();
		
		if (orphanedNotes.length === 0) {
			listContainer.createEl("div", { 
				text: "No orphaned notes found! 🎉",
				cls: "orphaned-notes-empty"
			});
			return;
		}

		orphanedNotes.forEach(note => {
			const noteItem = listContainer.createEl("div", { cls: "orphaned-note-item" });
			
			const noteTitle = noteItem.createEl("div", { 
				text: note.basename,
				cls: "orphaned-note-title clickable"
			});
			noteTitle.onclick = () => {
				this.app.workspace.openLinkText(note.basename, '');
			};

			const actionsDiv = noteItem.createEl("div", { cls: "orphaned-note-actions" });
			
			const linkButton = actionsDiv.createEl("button", { 
				text: "Link",
				cls: "mod-cta orphaned-note-btn"
			});
			linkButton.onclick = () => this.linkNote(note);

			// Add context menu
			noteItem.oncontextmenu = (e: MouseEvent) => {
				const menu = new Menu();
				menu.addItem((item: any) => {
					item.setTitle("Open Note")
						.setIcon("file-text")
						.onClick(() => {
							this.app.workspace.openLinkText(note.basename, '');
						});
				});
				menu.addItem((item: any) => {
					item.setTitle("Link Note")
						.setIcon("link")
						.onClick(() => {
							this.linkNote(note);
						});
				});
				menu.addItem((item: any) => {
					item.setTitle("Ignore")
						.setIcon("eye-off")
						.onClick(() => {
							this.ignoreNote(note);
						});
				});
				menu.showAtMouseEvent(e);
			};
		});
	}

	async findOrphanedNotes(): Promise<TFile[]> {
		const files = this.app.vault.getMarkdownFiles();
		const orphanedNotes: TFile[] = [];

		for (const file of files) {
			// Check if note should be ignored
			const cache = this.app.metadataCache.getFileCache(file);
			if (cache?.frontmatter && cache.frontmatter[this.plugin.settings.ignoreFrontmatter]) {
				continue;
			}

			// Check if note has incoming links using the resolved links
			const resolvedLinks = this.app.metadataCache.resolvedLinks;
			let hasIncomingLinks = false;
			
			// Check if any other file links to this file
			for (const [sourcePath, links] of Object.entries(resolvedLinks)) {
				if (links[file.path]) {
					hasIncomingLinks = true;
					break;
				}
			}

			if (!hasIncomingLinks) {
				orphanedNotes.push(file);
			}
		}

		return orphanedNotes;
	}

	async linkNote(file: TFile): Promise<void> {
		try {
			const content = await this.app.vault.read(file);
			const linkPrompt = `\n\n---\n**Review for Connections:**\n- [[ ]] # Add links to related Zettels here\n`;
			
			// Check if the prompt already exists
			if (!content.includes("**Review for Connections:**")) {
				await this.app.vault.modify(file, content + linkPrompt);
			}
			
			// Open the file
			const leaf = this.app.workspace.getUnpinnedLeaf();
			await leaf.openFile(file);
			
			// Focus on the empty link
			setTimeout(() => {
				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view) {
					const editor = view.editor;
					const newContent = editor.getValue();
					const linkIndex = newContent.lastIndexOf('[[ ]]');
					if (linkIndex !== -1) {
						const pos = editor.offsetToPos(linkIndex + 3);
						editor.setCursor(pos);
					}
				}
			}, 100);
			
		} catch (error) {
			new Notice('Error linking note: ' + error.message);
		}
	}

	async ignoreNote(file: TFile): Promise<void> {
		try {
			const content = await this.app.vault.read(file);
			const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
			const match = content.match(frontmatterRegex);
			
			let newContent = '';
			if (match) {
				// Add to existing frontmatter
				const frontmatter = match[1];
				const newFrontmatter = frontmatter + `\n${this.plugin.settings.ignoreFrontmatter}: true`;
				newContent = content.replace(frontmatterRegex, `---\n${newFrontmatter}\n---`);
			} else {
				// Add new frontmatter
				const newFrontmatter = `---\n${this.plugin.settings.ignoreFrontmatter}: true\n---\n\n`;
				newContent = newFrontmatter + content;
			}
			
			await this.app.vault.modify(file, newContent);
			await this.refresh();
			new Notice('Note ignored successfully');
		} catch (error) {
			new Notice('Error ignoring note: ' + error.message);
		}
	}

	async onClose(): Promise<void> {
		// Nothing to clean up.
	}
}

class ZettelLinkSettingTab extends PluginSettingTab {
	plugin: ZettelLinkPlugin;

	constructor(app: App, plugin: ZettelLinkPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'ZettelLink Settings'});

		new Setting(containerEl)
			.setName('Zettel ID Format')
			.setDesc('Choose the format for Zettel IDs')
			.addDropdown((dropdown: any) => dropdown
				.addOption('timestamp', 'YYYYMMDDHHMMSS')
				.addOption('uuid', 'UUID')
				.setValue(this.plugin.settings.idFormat)
				.onChange(async (value: 'timestamp' | 'uuid') => {
					this.plugin.settings.idFormat = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Append ID to filename')
			.setDesc('If enabled, ID will be appended (title-ID.md). If disabled, ID will be prepended (ID-title.md)')
			.addToggle((toggle: any) => toggle
				.setValue(this.plugin.settings.appendId)
				.onChange(async (value: boolean) => {
					this.plugin.settings.appendId = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show Ribbon Icon')
			.setDesc('Show the ZettelLink icon in the ribbon')
			.addToggle((toggle: any) => toggle
				.setValue(this.plugin.settings.showRibbonIcon)
				.onChange(async (value: boolean) => {
					this.plugin.settings.showRibbonIcon = value;
					await this.plugin.saveSettings();
					new Notice('Please restart Obsidian for this change to take effect');
				}));

		new Setting(containerEl)
			.setName('Enable Orphaned Notes Pane')
			.setDesc('Enable the orphaned notes detection pane')
			.addToggle((toggle: any) => toggle
				.setValue(this.plugin.settings.enableOrphanedPane)
				.onChange(async (value: boolean) => {
					this.plugin.settings.enableOrphanedPane = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Ignore Frontmatter Field')
			.setDesc('Frontmatter field name to ignore notes from orphaned detection (e.g., "zettel_ignore")')
			.addText((text: any) => text
				.setPlaceholder('zettel_ignore')
				.setValue(this.plugin.settings.ignoreFrontmatter)
				.onChange(async (value: string) => {
					this.plugin.settings.ignoreFrontmatter = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', {text: 'Template Settings'});

		new Setting(containerEl)
			.setName('Fleeting Note Template')
			.setDesc('Template for fleeting notes')
			.addTextArea((text: any) => text
				.setPlaceholder('Enter your fleeting note template...')
				.setValue(this.plugin.settings.fleetingTemplate)
				.onChange(async (value: string) => {
					this.plugin.settings.fleetingTemplate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Literature Note Template')
			.setDesc('Template for literature notes')
			.addTextArea((text: any) => text
				.setPlaceholder('Enter your literature note template...')
				.setValue(this.plugin.settings.literatureTemplate)
				.onChange(async (value: string) => {
					this.plugin.settings.literatureTemplate = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Permanent Note Template')
			.setDesc('Template for permanent notes (Zettels)')
			.addTextArea((text: any) => text
				.setPlaceholder('Enter your permanent note template...')
				.setValue(this.plugin.settings.permanentTemplate)
				.onChange(async (value: string) => {
					this.plugin.settings.permanentTemplate = value;
					await this.plugin.saveSettings();
				}));

		// Make text areas bigger
		containerEl.querySelectorAll('textarea').forEach((textarea: HTMLTextAreaElement) => {
			textarea.rows = 10;
			textarea.style.fontFamily = 'monospace';
		});
	}
}

// Remove inline style from ZettelTemplateModal.onOpen

// Remove inline style from OrphanedNotesView.refresh
