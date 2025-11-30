// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(target_os = "linux")]
    {
        use std::env;
        let desktop_env = env::var("XDG_CURRENT_DESKTOP").unwrap_or_default();
        // 在 KDE 环境下禁用 GTK CSD (Client Side Decorations)
        // 这解决了标题栏过大的问题，使用原生 KWin 标题栏
        if desktop_env.to_uppercase().contains("KDE") {
             env::set_var("GTK_CSD", "0");
        }
    }
    xmarkdown_lib::run()
}
