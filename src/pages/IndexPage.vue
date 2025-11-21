<template>
  <q-page class="todo-page">
    <div class="todo-container">
      <!-- Header -->
      <div class="todo-header">
        <h1 class="todo-title">Todos</h1>
        <p class="welcome-text">
          Welcome, {{ authStore.user?.first_name }} {{ authStore.user?.last_name }}!
        </p>
      </div>

      <!-- Main Todo App -->
      <div class="todo-app">
        <!-- Input Section -->
        <div class="todo-input-section">
          <q-checkbox
            v-model="allCompleted"
            @update:model-value="toggleAll"
            class="toggle-all-checkbox"
            :disable="tasks.length === 0"
            color="grey-6"
          />
          <q-input
            v-model="newTaskTitle"
            placeholder="What needs to be done?"
            @keyup.enter="addTask"
            class="new-todo-input"
            borderless
            :loading="isAdding"
          />
        </div>

        <!-- Task List -->
        <q-list v-if="filteredTasks.length > 0" class="todo-list">
          <q-item
            v-for="task in filteredTasks"
            :key="task.entity_id"
            class="todo-item"
            :class="{ completed: task.completed, editing: editingTaskId === task.entity_id }"
          >
            <!-- View Mode -->
            <template v-if="editingTaskId !== task.entity_id">
              <q-checkbox
                :model-value="task.completed"
                @update:model-value="toggleTask(task)"
                class="todo-checkbox"
                color="primary"
              />
              <q-item-section
                class="todo-label"
                @dblclick="startEdit(task)"
              >
                {{ task.title }}
              </q-item-section>
              <q-btn
                flat
                round
                dense
                icon="delete_outline"
                class="delete-btn"
                @click="deleteTask(task.entity_id)"
                :loading="deletingTaskId === task.entity_id"
              />
            </template>

            <!-- Edit Mode -->
            <template v-else>
              <q-input
                v-model="editTaskTitle"
                class="edit-input"
                borderless
                autofocus
                @keyup.enter="saveEdit(task)"
                @keyup.esc="cancelEdit"
                @blur="saveEdit(task)"
              />
            </template>
          </q-item>
        </q-list>

        <!-- Footer -->
        <div v-if="tasks.length > 0" class="todo-footer">
          <span class="todo-count">
            <strong>{{ remainingCount }}</strong>
            {{ remainingCount === 1 ? 'item' : 'items' }} left
          </span>

          <div class="filters">
            <q-btn
              flat
              :class="{ selected: filter === 'all' }"
              @click="filter = 'all'"
              label="All"
              class="filter-btn"
            />
            <q-btn
              flat
              :class="{ selected: filter === 'active' }"
              @click="filter = 'active'"
              label="Active"
              class="filter-btn"
            />
            <q-btn
              flat
              :class="{ selected: filter === 'completed' }"
              @click="filter = 'completed'"
              label="Completed"
              class="filter-btn"
            />
          </div>

          <q-btn
            v-if="completedCount > 0"
            flat
            @click="clearCompleted"
            label="Clear completed"
            class="clear-completed-btn"
          />
        </div>
      </div>

      <!-- Info Footer -->
      <div class="info">
        <p>Double-click to edit a todo</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { Notify } from 'quasar'
import taskService from 'src/services/task.service'

const authStore = useAuthStore()

// State
const tasks = ref([])
const newTaskTitle = ref('')
const editingTaskId = ref(null)
const editTaskTitle = ref('')
const filter = ref('all')
const isAdding = ref(false)
const deletingTaskId = ref(null)
const isLoading = ref(false)

// Computed
const filteredTasks = computed(() => {
  if (filter.value === 'active') {
    return tasks.value.filter((task) => !task.completed)
  }
  if (filter.value === 'completed') {
    return tasks.value.filter((task) => task.completed)
  }
  return tasks.value
})

const remainingCount = computed(() => {
  return tasks.value.filter((task) => !task.completed).length
})

const completedCount = computed(() => {
  return tasks.value.filter((task) => task.completed).length
})

const allCompleted = computed({
  get: () => tasks.value.length > 0 && remainingCount.value === 0,
  set: () => {
    // This setter is needed for v-model but the actual logic is in toggleAll
  },
})

// Methods
async function loadTasks() {
  isLoading.value = true
  try {
    const response = await taskService.getTasks()
    if (response.data?.success && response.data?.tasks) {
      tasks.value = response.data.tasks
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
    Notify.create({
      message: 'Failed to load tasks',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    isLoading.value = false
  }
}

async function addTask() {
  const title = newTaskTitle.value.trim()
  if (!title) return

  isAdding.value = true
  try {
    const response = await taskService.createTask({ title })
    if (response.data?.success && response.data?.task) {
      tasks.value.push(response.data.task)
      newTaskTitle.value = ''
      Notify.create({
        message: 'Task added successfully',
        color: 'positive',
        icon: 'check_circle',
        timeout: 1000,
      })
    }
  } catch (error) {
    console.error('Failed to add task:', error)
    Notify.create({
      message: 'Failed to add task',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    isAdding.value = false
  }
}

async function toggleTask(task) {
  const originalCompleted = task.completed
  task.completed = !task.completed

  try {
    const response = await taskService.updateTask(task.entity_id, {
      completed: task.completed,
    })
    if (!response.data?.success) {
      task.completed = originalCompleted
      Notify.create({
        message: 'Failed to update task',
        color: 'negative',
        icon: 'error',
      })
    }
  } catch (error) {
    console.error('Failed to toggle task:', error)
    task.completed = originalCompleted
    Notify.create({
      message: 'Failed to update task',
      color: 'negative',
      icon: 'error',
    })
  }
}

async function deleteTask(taskId) {
  deletingTaskId.value = taskId
  try {
    const response = await taskService.deleteTask(taskId)
    if (response.data?.success) {
      tasks.value = tasks.value.filter((task) => task.entity_id !== taskId)
      Notify.create({
        message: 'Task deleted',
        color: 'positive',
        icon: 'delete',
        timeout: 1000,
      })
    }
  } catch (error) {
    console.error('Failed to delete task:', error)
    Notify.create({
      message: 'Failed to delete task',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    deletingTaskId.value = null
  }
}

function startEdit(task) {
  editingTaskId.value = task.entity_id
  editTaskTitle.value = task.title
}

function cancelEdit() {
  editingTaskId.value = null
  editTaskTitle.value = ''
}

async function saveEdit(task) {
  const newTitle = editTaskTitle.value.trim()

  if (!newTitle) {
    // If empty, delete the task
    await deleteTask(task.entity_id)
    editingTaskId.value = null
    return
  }

  if (newTitle === task.title) {
    // No change
    editingTaskId.value = null
    return
  }

  try {
    const response = await taskService.updateTask(task.entity_id, {
      title: newTitle,
    })
    if (response.data?.success) {
      task.title = newTitle
    } else {
      Notify.create({
        message: 'Failed to update task',
        color: 'negative',
        icon: 'error',
      })
    }
  } catch (error) {
    console.error('Failed to update task:', error)
    Notify.create({
      message: 'Failed to update task',
      color: 'negative',
      icon: 'error',
    })
  } finally {
    editingTaskId.value = null
    editTaskTitle.value = ''
  }
}

async function toggleAll() {
  const shouldComplete = remainingCount.value > 0
  const updatePromises = tasks.value.map(async (task) => {
    if (task.completed !== shouldComplete) {
      const originalCompleted = task.completed
      task.completed = shouldComplete
      try {
        await taskService.updateTask(task.entity_id, {
          completed: shouldComplete,
        })
      } catch (error) {
        console.error('Failed to toggle task:', error)
        task.completed = originalCompleted
      }
    }
  })

  await Promise.all(updatePromises)
}

async function clearCompleted() {
  const completedTasks = tasks.value.filter((task) => task.completed)
  const deletePromises = completedTasks.map((task) =>
    taskService.deleteTask(task.entity_id)
  )

  try {
    await Promise.all(deletePromises)
    tasks.value = tasks.value.filter((task) => !task.completed)
    Notify.create({
      message: 'Completed tasks cleared',
      color: 'positive',
      icon: 'check_circle',
      timeout: 1000,
    })
  } catch (error) {
    console.error('Failed to clear completed tasks:', error)
    Notify.create({
      message: 'Failed to clear completed tasks',
      color: 'negative',
      icon: 'error',
    })
    // Reload tasks to ensure consistency
    await loadTasks()
  }
}

// Lifecycle
onMounted(() => {
  loadTasks()
})
</script>

<style scoped lang="scss">
.todo-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.todo-container {
  max-width: 800px;
  margin: 0 auto;
}

.todo-header {
  text-align: center;
  margin-bottom: 30px;

  .todo-title {
    font-size: 48px;
    font-weight: 300;
    color: #1976d2;
    margin: 0 0 10px 0;
    padding: 0;
  }

  .welcome-text {
    font-size: 16px;
    color: #26a69a;
    margin-top: 5px;
  }
}

.todo-app {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.todo-input-section {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);

  .toggle-all-checkbox {
    margin-right: 12px;
  }

  .new-todo-input {
    flex: 1;
    font-size: 18px;
    font-family: inherit;

    :deep(.q-field__control) {
      height: 48px;
    }

    :deep(input) {
      font-size: 18px;
      color: #333;
    }

    :deep(input::placeholder) {
      font-style: italic;
      opacity: 0.6;
      color: #999;
    }
  }
}

.todo-list {
  padding: 0;
  border-top: none;
}

.todo-item {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 16px 60px 16px 20px;
  min-height: 60px;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);

    .delete-btn {
      opacity: 1;
    }
  }

  &.completed .todo-label {
    opacity: 0.5;
    text-decoration: line-through;
  }

  &.editing {
    border-bottom: none;
    padding: 0;

    .edit-input {
      padding: 16px 60px 16px 20px;
      margin: 0;
      width: 100%;
      font-size: 16px;
      font-family: inherit;
      font-weight: inherit;
      line-height: 1.5;

      :deep(input) {
        font-size: 16px;
        color: #333;
      }

      :deep(.q-field__control) {
        border: 2px solid #1976d2;
      }
    }
  }

  .todo-checkbox {
    margin-right: 16px;
    flex-shrink: 0;
  }

  .todo-label {
    word-break: break-word;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    padding: 0;
    line-height: 1.5;
    transition: opacity 0.3s;
    cursor: pointer;
    user-select: none;
    color: #333;
    flex: 1;
  }

  .delete-btn {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease-out;
    color: #c62828;
    flex-shrink: 0;

    &:hover {
      color: #c62828;
      opacity: 1 !important;
    }
  }
}

.todo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  min-height: 60px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  font-size: 14px;
  background-color: #f5f5f5;

  .todo-count {
    text-align: left;
    color: #666;

    strong {
      font-weight: 600;
      color: #1976d2;
    }
  }

  .filters {
    display: flex;
    gap: 8px;

    .filter-btn {
      font-size: 13px;
      padding: 6px 12px;
      text-transform: capitalize;
      min-height: auto;
      border-radius: 4px;
      color: #666;

      &.selected {
        background-color: #1976d2;
        color: white;
      }
    }
  }

  .clear-completed-btn {
    font-size: 13px;
    padding: 6px 12px;
    text-transform: none;
    min-height: auto;
    border-radius: 4px;
    color: #666;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
}

.info {
  margin-top: 40px;
  text-align: center;
  color: #999;
  font-size: 12px;

  p {
    margin: 8px 0;
  }
}

// Responsive adjustments
@media (max-width: 600px) {
  .todo-page {
    padding: 10px;
  }

  .todo-header .todo-title {
    font-size: 36px;
  }

  .todo-input-section {
    padding: 16px;

    .new-todo-input :deep(input) {
      font-size: 16px;
    }
  }

  .todo-item {
    font-size: 14px;
    padding: 12px 16px;

    &.editing .edit-input {
      padding: 12px 16px;

      :deep(input) {
        font-size: 14px;
      }
    }
  }

  .todo-footer {
    flex-direction: column;
    height: auto;
    gap: 12px;
    padding: 16px;

    .todo-count,
    .filters,
    .clear-completed-btn {
      width: 100%;
      text-align: center;
      justify-content: center;
    }
  }
}
</style>
