!define MUI_FINISHPAGE_TITLE "Your workspace is ready"
!define MUI_FINISHPAGE_TEXT "Open Code Review has been installed.$\r$\n$\r$\nLaunch the app, choose a repository and start your first review."
!define MUI_ABORTWARNING

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "Open Code Review"
  !define MUI_WELCOMEPAGE_TEXT "A clearer view of your code.$\r$\n$\r$\nReview changes, explore findings and manage your AI providers in one focused workspace.$\r$\n$\r$\nThe setup wizard will guide you through installation."
  !insertmacro MUI_PAGE_WELCOME
!macroend
