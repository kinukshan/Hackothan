import axios from 'axios'
import { API_BASE_URL } from './config'

const API_URL = API_BASE_URL

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export default client
