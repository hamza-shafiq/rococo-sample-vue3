import apiClient from 'src/config/axios'

class TaskService {
  async getTasks(completed = null) {
    const params = {}
    if (completed !== null) {
      params.completed = completed
    }
    return apiClient.get('/tasks', { params })
  }

  async getTaskById(taskId) {
    return apiClient.get(`/tasks/${taskId}`)
  }

  async createTask(taskData) {
    return apiClient.post('/tasks', taskData)
  }

  async updateTask(taskId, taskData) {
    return apiClient.put(`/tasks/${taskId}`, taskData)
  }

  async deleteTask(taskId) {
    return apiClient.delete(`/tasks/${taskId}`)
  }
}

export default new TaskService()
