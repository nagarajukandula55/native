# Run this from the root of the `native` repo (D:\Development\native) AFTER
# the updated frontend files have been applied/committed. It removes the
# backend-only files that are no longer part of this frontend repo — they
# now live in the separate backend-reference bundle for the AN group.
#
# Usage (PowerShell):
#   cd D:\Development\native
#   .\cleanup-backend-files.ps1
#
# Safe to re-run; skips anything already missing.

$paths = @(
  "app\api",
  "models",
  "layouts",
  "scripts\import-pincodes.ts",
  "app\context",
  "app\components",
  "data\pincodes.csv",
  "pincodes.csv",

  # Internal "ANu AI DevOps Dashboard" — posted pasted error text to a
  # hardcoded external service and could trigger creating GitHub PRs, with
  # no auth guard, reachable at a public route on the live storefront.
  # Not e-commerce functionality; removed rather than ported anywhere.
  # See AUDIT_FINDINGS.md for details.
  "app\anu",

  "lib\auth.js",
  "lib\autonomousBrain.js",
  "lib\autonomousEngine.js",
  "lib\chrome.js",
  "lib\cloudinary.js",
  "lib\coupon.ts",
  "lib\db.js",
  "lib\email.js",
  "lib\erpPdfV3.js",
  "lib\generateInvoiceNumber.js",
  "lib\generateOrderId.js",
  "lib\generateReceiptNumber.js",
  "lib\generateReceiptPDF.js",
  "lib\gst.js",
  "lib\guard.js",
  "lib\handleOrderPaid.js",
  "lib\hsn.js",
  "lib\inventory.js",
  "lib\invoice.js",
  "lib\invoiceNumber.js",
  "lib\invoiceTemplate.js",
  "lib\merchantTransform.js",
  "lib\mongodb.js",
  "lib\orderId.js",
  "lib\orderStatusManager.js",
  "lib\pdfLibInvoice.js",
  "lib\pdfSetup.js",
  "lib\productId.js",
  "lib\receipt.js",
  "lib\receiptHTML.js",
  "lib\sendInvoiceEmail.js",
  "lib\shiprocket.js",
  "lib\sku.js",
  "lib\skuGenerator.js",
  "lib\telegram.js",
  "lib\templates.js",
  "lib\whatsapp.js",

  "lib\core",
  "lib\engine",
  "lib\erp",
  "lib\invoice",
  "lib\layout",
  "lib\mongoose",
  "lib\order",
  "lib\pdf",
  "lib\receipt",
  "lib\safe",
  "lib\service",
  "lib\services",
  "lib\store",
  "lib\whatsapp"
)

foreach ($p in $paths) {
  if (Test-Path $p) {
    Remove-Item -Recurse -Force $p
    Write-Host "Removed: $p"
  } else {
    Write-Host "Skipped (already gone): $p"
  }
}

# Clean up the scripts folder if it's now empty
if ((Test-Path "scripts") -and ((Get-ChildItem "scripts" -Force | Measure-Object).Count -eq 0)) {
  Remove-Item "scripts"
  Write-Host "Removed empty scripts\ folder"
}

Write-Host ""
Write-Host "Done. lib\permissions.js, lib\roleMenus.js, lib\category.js, lib\product.js," -ForegroundColor Green
Write-Host "lib\seo.js, lib\gtag.js, lib\socket.js, lib\useAuth.js, and lib\an-sdk\ were kept" -ForegroundColor Green
Write-Host "intentionally — they're frontend code." -ForegroundColor Green
