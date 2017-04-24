const xhr = {
  request: (method, path, data) => {
    return new Promise((resolve, reject) => {
      const url     = `${path}`;

      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      };

      if (data) {
        options.body = JSON.stringify(data)
      }
      fetch(url, options)
      .then(response => {
        resolve(response);
      })
      .catch(error => {
        reject();
      });
    });
  },

  post: (path, data) => {
    return xhr.request ('POST', path, data)
  },

  get: (path) => {
    return xhr.request ('GET', path);
  }
};