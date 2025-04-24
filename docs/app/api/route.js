
export async function GET(request) {
  // This is a simple redirect to the static JSDoc files
  const url = new URL(request.url);
  const path = url.pathname.replace(/^/api/, '');
  
  // Redirect to the root if no path is specified
  const redirectPath = path === '' || path === '/' 
    ? '/api/index.html' 
    : url.pathname;
    
  return Response.redirect(new URL(redirectPath, url.origin));
}
