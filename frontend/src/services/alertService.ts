import axios from 'axios'

export const sendTestAlert = async () => {
  try {
    const response = await axios.post(
      'http://localhost:5000/api/alerts/test'
    )

    return response.data
  } catch (error) {
    console.error('Alert failed:', error)
    throw error
  }
}