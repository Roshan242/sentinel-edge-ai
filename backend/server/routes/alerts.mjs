  export const handleAlertRoutes = async ({ method, path }) => {
    if (method === 'GET' && path === '/alerts') {
      return false
    }

    if (method === 'POST' && path === '/alerts') {
      return false
    }

    return false
  }





