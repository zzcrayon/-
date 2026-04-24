# Android 安装包说明

这个目录是安卓版本工程，使用原生 WebView 内置贪吃蛇网页游戏。打开后不需要联网。

## 生成 APK

1. 安装 Android Studio。
2. 用 Android Studio 打开 `android-apk` 文件夹。
3. 等待 Gradle Sync 完成。
4. 菜单选择 `Build > Build Bundle(s) / APK(s) > Build APK(s)`。
5. 生成文件通常在：

```text
android-apk/app/build/outputs/apk/debug/app-debug.apk
```

把这个 APK 发到安卓手机后安装即可。

## 不安装软件，云端生成 APK

如果不想在电脑上安装 Android Studio，可以用 GitHub Actions 在线打包：

1. 登录 GitHub。
2. 新建一个仓库。
3. 上传整个项目文件夹，至少要包含 `android-apk` 和 `.github/workflows/android-apk.yml`。
4. 进入仓库的 `Actions` 页面。
5. 选择 `Build Android APK`。
6. 点击 `Run workflow`。
7. 等待构建完成。
8. 打开完成的构建记录，在页面底部 `Artifacts` 下载 `SnakeGame-Android-APK`。
9. 解压后得到 `app-debug.apk`，发到安卓手机安装即可。

## 命令行打包

如果电脑已经安装好 JDK 17、Android SDK 和 Gradle，可以在本目录运行：

```powershell
gradle assembleDebug
```

官方 Android Gradle 插件 8.13.x 需要 JDK 17 和 Gradle 8.13。
