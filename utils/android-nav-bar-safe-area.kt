// This is meant to adapt the web content to Android's navigation bar safe area.
// It injects a CSS variable '--safe-bottom' into the web content, which can be
// used to adjust layouts accordingly.

// ADD THIS CODE INTO MAIN ACTIVITY OR WHERE THE WEBVIEW IS INITIALIZED

// IMPORTANT: attach listener to the WebView, not android.R.id.content
View webView = bridge.getWebView().getRootView();

ViewCompat.setOnApplyWindowInsetsListener(webView, (v, insets) -> {
	int bottomInset =
			insets.getInsets(WindowInsetsCompat.Type.navigationBars()).bottom;

	// Inject ONLY bottom inset
	String js =
			"document.documentElement.style.setProperty('--safe-bottom','"
					+ bottomInset + "px');";

	bridge.getWebView().post(() ->
			bridge.getWebView().evaluateJavascript(js, null)
	);

	// Return insets untouched → preserves edge-to-edge
	return insets;
});