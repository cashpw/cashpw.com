const referencesHeading = document.querySelector('#references');
if (referencesHeading) {
  referencesHeading.outerHTML =
    '<hr>'
    + '<h4 id="references">' + references.innerHTML + '</h4>';
}
