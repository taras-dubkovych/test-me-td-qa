function request(method, url, options = {}) {
  const {token, headers = {}, ...requestOptions} = options;
  const requestHeaders = {...headers};

  if (token !== undefined) {
    requestHeaders['X-Workspace-Token'] = token;
  }

  return cy.request({
    ...requestOptions,
    method,
    url,
    headers: requestHeaders,
    failOnStatusCode: requestOptions.failOnStatusCode ?? false,
    log: requestOptions.log ?? false
  });
}

const api = {
  request,
  get: (url, options) => request('GET', url, options),
  post: (url, body, options = {}) => request('POST', url, {...options, body}),
  put: (url, body, options = {}) => request('PUT', url, {...options, body}),
  createWorkspace: () => request('POST', '/api/workspaces')
};

module.exports = api;
