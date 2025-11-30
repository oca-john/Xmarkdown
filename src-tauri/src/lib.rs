use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem, Submenu},
    AppHandle, Emitter, Manager,
};

// 菜单文本结构
struct MenuTexts {
    file: &'static str,
    new: &'static str,
    open: &'static str,
    open_folder: &'static str,
    save: &'static str,
    save_as: &'static str,
    quit: &'static str,
    edit: &'static str,
    undo: &'static str,
    redo: &'static str,
    cut: &'static str,
    copy: &'static str,
    paste: &'static str,
    select_all: &'static str,
    settings: &'static str,
    view: &'static str,
    toggle_sidebar: &'static str,
    split_view: &'static str,
    editor_only: &'static str,
    preview_only: &'static str,
    sync_scroll: &'static str,
    about: &'static str,
}

fn get_menu_texts(lang: &str) -> MenuTexts {
    match lang {
        "zh-TW" => MenuTexts {
            file: "檔案",
            new: "新建",
            open: "開啟檔案...",
            open_folder: "開啟資料夾...",
            save: "儲存",
            save_as: "另存為...",
            quit: "結束",
            edit: "編輯",
            undo: "復原",
            redo: "重做",
            cut: "剪下",
            copy: "複製",
            paste: "貼上",
            select_all: "全選",
            settings: "設定...",
            view: "檢視",
            toggle_sidebar: "切換側邊欄",
            split_view: "分欄視圖",
            editor_only: "僅編輯器",
            preview_only: "僅預覽",
            sync_scroll: "同步滾動",
            about: "關於",
        },
        "en" => MenuTexts {
            file: "File",
            new: "New",
            open: "Open File...",
            open_folder: "Open Folder...",
            save: "Save",
            save_as: "Save As...",
            quit: "Quit",
            edit: "Edit",
            undo: "Undo",
            redo: "Redo",
            cut: "Cut",
            copy: "Copy",
            paste: "Paste",
            select_all: "Select All",
            settings: "Settings...",
            view: "View",
            toggle_sidebar: "Toggle Sidebar",
            split_view: "Split View",
            editor_only: "Editor Only",
            preview_only: "Preview Only",
            sync_scroll: "Sync Scroll",
            about: "About",
        },
        _ => MenuTexts { // zh-CN (default)
            file: "文件",
            new: "新建",
            open: "打开文件...",
            open_folder: "打开文件夹...",
            save: "保存",
            save_as: "另存为...",
            quit: "退出",
            edit: "编辑",
            undo: "撤销",
            redo: "重做",
            cut: "剪切",
            copy: "复制",
            paste: "粘贴",
            select_all: "全选",
            settings: "设置...",
            view: "视图",
            toggle_sidebar: "切换侧边栏",
            split_view: "分栏视图",
            editor_only: "仅编辑器",
            preview_only: "仅预览",
            sync_scroll: "同步滚动",
            about: "关于",
        },
    }
}

fn create_menu_with_lang<M: Manager<tauri::Wry>>(app: &M, lang: &str) -> tauri::Result<Menu<tauri::Wry>> {
    let t = get_menu_texts(lang);

    // 文件菜单
    let file_menu = Submenu::with_items(
        app,
        t.file,
        true,
        &[
            &MenuItem::with_id(app, "new", t.new, true, Some("CmdOrCtrl+N"))?,
            &MenuItem::with_id(app, "open", t.open, true, Some("CmdOrCtrl+O"))?,
            &MenuItem::with_id(app, "open_folder", t.open_folder, true, Some("CmdOrCtrl+Shift+O"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "save", t.save, true, Some("CmdOrCtrl+S"))?,
            &MenuItem::with_id(app, "save_as", t.save_as, true, Some("CmdOrCtrl+Shift+S"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "quit", t.quit, true, Some("CmdOrCtrl+Q"))?,
        ],
    )?;

    // 编辑菜单
    let edit_menu = Submenu::with_items(
        app,
        t.edit,
        true,
        &[
            &MenuItem::with_id(app, "undo", t.undo, true, Some("CmdOrCtrl+Z"))?,
            &MenuItem::with_id(app, "redo", t.redo, true, Some("CmdOrCtrl+Y"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "cut", t.cut, true, Some("CmdOrCtrl+X"))?,
            &MenuItem::with_id(app, "copy", t.copy, true, Some("CmdOrCtrl+C"))?,
            &MenuItem::with_id(app, "paste", t.paste, true, Some("CmdOrCtrl+V"))?,
            &MenuItem::with_id(app, "select_all", t.select_all, true, Some("CmdOrCtrl+A"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "settings", t.settings, true, Some("CmdOrCtrl+Comma"))?,
        ],
    )?;

    // 视图菜单
    let view_menu = Submenu::with_items(
        app,
        t.view,
        true,
        &[
            &MenuItem::with_id(app, "toggle_sidebar", t.toggle_sidebar, true, Some("CmdOrCtrl+B"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "view_editor", t.editor_only, true, Some("CmdOrCtrl+1"))?,
            &MenuItem::with_id(app, "view_split", t.split_view, true, Some("CmdOrCtrl+2"))?,
            &MenuItem::with_id(app, "view_preview", t.preview_only, true, Some("CmdOrCtrl+3"))?,
            &PredefinedMenuItem::separator(app)?,
            &MenuItem::with_id(app, "toggle_sync_scroll", t.sync_scroll, true, None::<&str>)?,
        ],
    )?;

    // 关于菜单
    let about_menu = Submenu::with_items(
        app,
        t.about,
        true,
        &[
            &MenuItem::with_id(app, "about", t.about, true, Some("CmdOrCtrl+I"))?,
        ],
    )?;

    Menu::with_items(app, &[&file_menu, &edit_menu, &view_menu, &about_menu])
}

#[tauri::command]
fn update_menu_language(app: AppHandle, lang: String) -> Result<(), String> {
    let menu = create_menu_with_lang(&app, &lang).map_err(|e| e.to_string())?;
    app.set_menu(menu).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_linux_desktop_env() -> String {
    #[cfg(target_os = "linux")]
    {
        std::env::var("XDG_CURRENT_DESKTOP").unwrap_or_default()
    }
    #[cfg(not(target_os = "linux"))]
    {
        String::new()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // 创建并设置菜单（默认中文）
            let menu = create_menu_with_lang(app, "zh-CN")?;
            app.set_menu(menu)?;

            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .on_menu_event(|app, event| {
            let window = app.get_webview_window("main").unwrap();
            match event.id().as_ref() {
                "new" => { let _ = window.emit("menu-new", ()); }
                "open" => { let _ = window.emit("menu-open", ()); }
                "open_folder" => { let _ = window.emit("menu-open-folder", ()); }
                "save" => { let _ = window.emit("menu-save", ()); }
                "save_as" => { let _ = window.emit("menu-save-as", ()); }
                "quit" => { app.exit(0); }
                
                "undo" => { let _ = window.emit("menu-undo", ()); }
                "redo" => { let _ = window.emit("menu-redo", ()); }
                "cut" => { let _ = window.emit("menu-cut", ()); }
                "copy" => { let _ = window.emit("menu-copy", ()); }
                "paste" => { let _ = window.emit("menu-paste", ()); }
                "select_all" => { let _ = window.emit("menu-select-all", ()); }
                "settings" => { let _ = window.emit("menu-settings", ()); }
                
                "toggle_sidebar" => { let _ = window.emit("menu-toggle-sidebar", ()); }
                "view_split" => { let _ = window.emit("menu-view", "split"); }
                "view_editor" => { let _ = window.emit("menu-view", "editor"); }
                "view_preview" => { let _ = window.emit("menu-view", "preview"); }
                "toggle_sync_scroll" => { let _ = window.emit("menu-toggle-sync-scroll", ()); }
                "about" => { let _ = window.emit("menu-about", ()); }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![update_menu_language, get_linux_desktop_env])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
