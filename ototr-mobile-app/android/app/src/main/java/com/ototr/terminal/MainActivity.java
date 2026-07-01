package com.ototr.terminal;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.util.Log;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    allowLocalDevelopmentApiRequests();
    enableWebViewDebugging();
    logWebViewUrl("onCreate");
    applyImmersiveMode();
  }

  @Override
  public void onWindowFocusChanged(boolean hasFocus) {
    super.onWindowFocusChanged(hasFocus);
    if (hasFocus) {
      applyImmersiveMode();
    }
  }

  private void applyImmersiveMode() {
    Window window = getWindow();
    window.setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      window.setDecorFitsSystemWindows(false);
      WindowInsetsController controller = window.getInsetsController();
      if (controller != null) {
        controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
        controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
      }
    }
    window.getDecorView().setSystemUiVisibility(
      View.SYSTEM_UI_FLAG_FULLSCREEN
        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    );
  }

  private void allowLocalDevelopmentApiRequests() {
    WebView webView = getBridge().getWebView();
    if (webView == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
      return;
    }

    webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
  }

  private void enableWebViewDebugging() {
    if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
      WebView.setWebContentsDebuggingEnabled(true);
    }
  }

  private void logWebViewUrl(String stage) {
    WebView webView = getBridge().getWebView();
    if (webView == null) {
      Log.e("OTOTR_WEBVIEW", stage + " webView=null");
      return;
    }

    webView.postDelayed(() -> Log.i("OTOTR_WEBVIEW", stage + " t+500 url=" + webView.getUrl()), 500);
    webView.postDelayed(() -> Log.i("OTOTR_WEBVIEW", stage + " t+2000 url=" + webView.getUrl()), 2000);
    webView.postDelayed(() -> Log.i("OTOTR_WEBVIEW", stage + " t+5000 url=" + webView.getUrl()), 5000);
  }
}
