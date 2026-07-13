<template>
  <div class="report-table-wrapper">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="mb-0 font-weight-bold">{{ title }}</h6>
      <div class="d-flex gap-2">
        <div class="input-group input-group-sm" style="max-width:200px">
          <div class="input-group-prepend">
            <span class="input-group-text"><i class="feather icon-search"></i></span>
          </div>
          <input type="text" class="form-control" v-model="searchQuery" placeholder="Buscar..." />
        </div>
      </div>
    </div>

    <div v-if="!tableData || tableData.length === 0" class="text-center py-4">
      <i class="feather icon-inbox" style="font-size:2rem;color:#ccc"></i>
      <p class="text-muted mt-2">No hay datos disponibles</p>
    </div>

    <div v-else class="table-responsive">
      <table class="table table-hover table-sm">
        <thead>
          <tr>
            <th v-for="col in visibleColumns" :key="col.key" @click="toggleSort(col.key)" style="cursor:pointer">
              {{ col.label }}
              <span v-if="sortField === col.key" class="ml-1">
                <i class="feather" :class="sortDir === 'asc' ? 'icon-chevron-up' : 'icon-chevron-down'"></i>
              </span>
            </th>
            <th v-if="!hideActions">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in filteredData" :key="row.id || idx">
            <td v-for="col in visibleColumns" :key="col.key">
              <template v-if="col.key === 'image' || col.key === 'photo'">
                <img v-if="row[col.key]" :src="row[col.key]" alt="" class="table-thumb" />
                <span v-else class="text-muted small">—</span>
              </template>
              <template v-else-if="col.key === 'status' || col.key === 'estado'">
                <span class="badge" :class="getStatusBadge(row[col.key])">
                  {{ getStatusLabel(row[col.key]) }}
                </span>
              </template>
              <template v-else-if="col.key === 'category' || col.key === 'categoria'">
                <span class="badge badge-info">{{ row[col.key]?.name || row[col.key] || '—' }}</span>
              </template>
              <template v-else-if="col.key === 'price' || col.key === 'precio'">
                ${{ Number(row[col.key] || 0).toLocaleString() }}
              </template>
              <template v-else-if="col.key === 'created_at' || col.key === 'fecha' || col.key === 'date'">
                {{ formatDate(row[col.key]) }}
              </template>
              <template v-else>
                {{ row[col.key] || '—' }}
              </template>
            </td>
            <td v-if="!hideActions">
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-info" title="Ver estudiantes" @click="$emit('view-students', row.id)">
                  <i class="feather icon-users"></i>
                </button>
                <button class="btn btn-outline-secondary" title="Ver detalle" @click="$emit('view-detail', row)">
                  <i class="feather icon-eye"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="d-flex justify-content-between align-items-center mt-3">
      <small class="text-muted">
        Mostrando {{ (currentPage - 1) * perPage + 1 }}–{{ Math.min(currentPage * perPage, filteredData.length) }} de {{ filteredData.length }}
      </small>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage <= 1 }">
            <a class="page-link" href="#" @click.prevent="currentPage > 1 && currentPage--">&laquo;</a>
          </li>
          <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }">
            <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
            <a class="page-link" href="#" @click.prevent="currentPage < totalPages && currentPage++">&raquo;</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatDate } from '@/utils/formatDate'

const props = defineProps({
  data: { type: [Array, Object], default: () => [] },
  type: { type: String, default: 'masterclass' },
  title: { type: String, default: 'Reporte' },
  columns: { type: Array, default: null },
  hideActions: { type: Boolean, default: false },
  perPage: { type: Number, default: 10 },
})

defineEmits(['view-students', 'view-detail'])

const searchQuery = ref('')
const sortField = ref('')
const sortDir = ref('asc')
const currentPage = ref(1)

const defaultColumns = {
  masterclass: [
    { key: 'image', label: 'Imagen' },
    { key: 'title', label: 'Título' },
    { key: 'category', label: 'Categoría' },
    { key: 'status', label: 'Estado' },
    { key: 'price', label: 'Precio' },
    { key: 'students_count', label: 'Estudiantes' },
    { key: 'created_at', label: 'Creado' },
  ],
  'mini-course': [
    { key: 'image', label: 'Imagen' },
    { key: 'title', label: 'Título' },
    { key: 'category', label: 'Categoría' },
    { key: 'status', label: 'Estado' },
    { key: 'price', label: 'Precio' },
    { key: 'modules_count', label: 'Módulos' },
    { key: 'created_at', label: 'Creado' },
  ],
  ebook: [
    { key: 'image', label: 'Portada' },
    { key: 'title', label: 'Título' },
    { key: 'category', label: 'Categoría' },
    { key: 'status', label: 'Estado' },
    { key: 'price', label: 'Precio' },
    { key: 'pages', label: 'Páginas' },
    { key: 'created_at', label: 'Creado' },
  ],
}

const visibleColumns = computed(() => props.columns || defaultColumns[props.type] || defaultColumns.masterclass)

const tableData = computed(() => {
  const raw = props.data
  if (Array.isArray(raw)) return raw
  if (raw && raw.data && Array.isArray(raw.data)) return raw.data
  if (raw && typeof raw === 'object') {
    const arr = Object.values(raw).filter(v => Array.isArray(v))
    if (arr.length > 0) return arr[0]
  }
  return []
})

const filteredData = computed(() => {
  let result = tableData.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(row =>
      Object.values(row).some(val =>
        String(val || '').toLowerCase().includes(q)
      )
    )
  }
  if (sortField.value) {
    result = [...result].sort((a, b) => {
      const aVal = a[sortField.value]
      const bVal = b[sortField.value]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDir.value === 'asc' ? cmp : -cmp
    })
  }
  return result
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / props.perPage))

function toggleSort(key) {
  if (sortField.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = key
    sortDir.value = 'asc'
  }
  currentPage.value = 1
}

function getStatusBadge(status) {
  if (status === 1 || status === 'published' || status === 'active') return 'badge-success'
  if (status === 0 || status === 'draft' || status === 'inactive') return 'badge-secondary'
  if (status === 2 || status === 'pending') return 'badge-warning'
  if (status === 3 || status === 'rejected') return 'badge-danger'
  return 'badge-info'
}

function getStatusLabel(status) {
  if (status === 1 || status === 'published') return 'Publicado'
  if (status === 'active') return 'Activo'
  if (status === 0) return 'Borrador'
  if (status === 'draft') return 'Borrador'
  if (status === 'inactive') return 'Inactivo'
  if (status === 2 || status === 'pending') return 'Pendiente'
  if (status === 3 || status === 'rejected') return 'Rechazado'
  return status || '—'
}

watch(searchQuery, () => { currentPage.value = 1 })
</script>

<style scoped>
.table-thumb {
  width: 40px; height: 40px;
  object-fit: cover;
  border-radius: 6px;
}
.report-table-wrapper .table th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8898aa;
  border-top: none;
  white-space: nowrap;
}
.report-table-wrapper .table td {
  font-size: 0.9rem;
  vertical-align: middle;
}
</style>
