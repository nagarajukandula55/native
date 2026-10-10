package in.shopnative.app;

import android.os.Build;
import android.os.Bundle;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

/**
 * The app loads the live site (capacitor.config.ts server.url) directly
 * into the WebView. Without this override, a failed main-frame load (no
 * internet, DNS failure, server down) falls through to Chromium's own
 * unbranded "No internet" error page. This instead swaps in the bundled
 * public/offline.html (served by Capacitor's local asset server at
 * https://localhost/offline.html regardless of server.url) with a "Try
 * Again" button that re-navigates to the live site.
 */
public class MainActivity extends BridgeActivity {
  private static final String OFFLINE_URL = "https://localhost/offline.html";

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // Capacitor's BridgeActivity does NOT handle the hardware/gesture back
    // button by itself -- without this, every back press exited the whole
    // app instead of navigating back through the site's own page history
    // (the SPA's client-side route changes, e.g. live-market -> live-
    // market/orders, DO register as WebView history entries via
    // history.pushState, so canGoBack() correctly reflects in-app
    // navigation). Only exits the app once there's truly nowhere left to
    // go back to.
    getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
      @Override
      public void handleOnBackPressed() {
        WebView webView = bridge.getWebView();
        if (webView != null && webView.canGoBack()) {
          webView.goBack();
        } else {
          setEnabled(false);
          getOnBackPressedDispatcher().onBackPressed();
        }
      }
    });
  }

  @Override
  public void onStart() {
    super.onStart();
    WebView webView = this.bridge.getWebView();
    webView.setWebViewClient(
      new BridgeWebViewClient(this.bridge) {
        @Override
        public void onReceivedError(
          WebView view,
          WebResourceRequest request,
          WebResourceError error
        ) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && request.isForMainFrame()) {
            view.loadUrl(OFFLINE_URL);
          } else {
            super.onReceivedError(view, request, error);
          }
        }

        @Override
        public void onReceivedError(
          WebView view,
          int errorCode,
          String description,
          String failingUrl
        ) {
          view.loadUrl(OFFLINE_URL);
        }
      }
    );
  }
}
