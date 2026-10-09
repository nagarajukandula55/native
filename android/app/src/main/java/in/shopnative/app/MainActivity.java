package in.shopnative.app;

import android.os.Build;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
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
