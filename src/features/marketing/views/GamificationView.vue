<template>
  <div class="gamification">
    <div class="page-header">
      <h1>Gamificación</h1>
      <div class="tabs">
        <button :class="{ active: tab === 'ranking' }" @click="tab = 'ranking'">Ranking</button>
        <button :class="{ active: tab === 'levels' }" @click="tab = 'levels'">Niveles</button>
        <button :class="{ active: tab === 'badges' }" @click="tab = 'badges'">Insignias</button>
        <button :class="{ active: tab === 'rewards' }" @click="tab = 'rewards'">Recompensas</button>
        <button :class="{ active: tab === 'config' }" @click="tab = 'config'">Configuración</button>
      </div>
    </div>

    <div v-if="store.loading" class="loading">Cargando...</div>

    <!-- TAB: Ranking -->
    <div v-if="tab === 'ranking'" class="tab-content">
      <div class="card">
        <div class="card-header"><h2>Ranking de Puntos</h2></div>
        <div class="card-body">
          <p v-if="store.myPosition > 0" class="my-position">Tu posición: <strong>#{{ store.myPosition }}</strong></p>
          <table v-if="store.ranking.length" class="table">
            <thead><tr><th>#</th><th>Usuario</th><th>Puntos</th></tr></thead>
            <tbody>
              <tr v-for="(user, i) in store.ranking" :key="user.user_id">
                <td>{{ i + 1 }}</td><td>{{ user.name }}</td><td>{{ user.total_points }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">No hay datos de ranking</p>
        </div>
      </div>

      <div class="card" v-if="store.myInfo">
        <div class="card-header"><h2>Mi Progreso</h2></div>
        <div class="card-body">
          <p><strong>Puntos totales:</strong> {{ store.myInfo.total_points }}</p>
          <p v-if="store.myInfo.current_level"><strong>Nivel actual:</strong> {{ store.myInfo.current_level.description }}</p>
          <p v-if="store.myInfo.next_level"><strong>Siguiente nivel:</strong> {{ store.myInfo.next_level.description }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: Math.min(store.myInfo.progress_percentage, 100) + '%' }"></div>
            <span class="progress-text">{{ Math.round(store.myInfo.progress_percentage) }}%</span>
          </div>
          <div v-if="store.myInfo.points_detail?.length" class="detail-list">
            <h3>Últimos movimientos</h3>
            <div v-for="det in store.myInfo.points_detail" :key="det.id" class="detail-item">
              <span>{{ det.description }}</span><span class="points">+{{ det.increment_points }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: Levels -->
    <div v-if="tab === 'levels'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>Niveles de Usuario</h2>
          <button class="btn-primary" @click="showLevelForm = true">+ Nuevo Nivel</button>
        </div>
        <div class="card-body">
          <table v-if="store.levels.length" class="table">
            <thead><tr><th>ID</th><th>Descripción</th><th>Exp. Requerida</th><th>Icono</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="level in store.levels" :key="level.id">
                <td>{{ level.id }}</td><td>{{ level.description }}</td><td>{{ level.experience_required }}</td>
                <td>{{ level.url_icon || '-' }}</td><td><button class="btn-sm" @click="editLevel(level)">Editar</button></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">No hay niveles configurados</p>
        </div>
      </div>

      <div v-if="showLevelForm" class="modal">
        <div class="modal-content">
          <h3>{{ editingLevel ? 'Editar Nivel' : 'Nuevo Nivel' }}</h3>
          <form @submit.prevent="saveLevel">
            <div class="form-group"><label>Descripción *</label><input v-model="levelForm.description" type="text" required /></div>
            <div class="form-group"><label>Experiencia Requerida *</label><input v-model.number="levelForm.experience_required" type="number" min="0" required /></div>
            <div class="form-group"><label>URL Icono</label><input v-model="levelForm.url_icon" type="text" /></div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Guardar</button>
              <button type="button" class="btn-secondary" @click="showLevelForm = false">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- TAB: Badges -->
    <div v-if="tab === 'badges'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>Insignias</h2>
          <button class="btn-primary" @click="showBadgeForm = true">+ Nueva Insignia</button>
        </div>
        <div class="card-body">
          <div v-if="store.badges.length" class="badges-grid">
            <div v-for="badge in store.badges" :key="badge.id" :class="['badge-card', { obtained: badge.obtained }]">
              <div class="badge-icon">{{ badge.icon }}</div>
              <div class="badge-info">
                <h4>{{ badge.name }}</h4><p>{{ badge.description }}</p>
                <span :class="badge.obtained ? 'badge-obtained' : 'badge-locked'">{{ badge.obtained ? 'Obtenida' : 'Bloqueada' }}</span>
              </div>
              <button class="btn-sm" @click="editBadge(badge)">Editar</button>
            </div>
          </div>
          <p v-else class="empty">No hay insignias</p>
        </div>
      </div>

      <div v-if="showBadgeForm" class="modal">
        <div class="modal-content">
          <h3>{{ editingBadge ? 'Editar Insignia' : 'Nueva Insignia' }}</h3>
          <form @submit.prevent="saveBadge">
            <div class="form-group"><label>Nombre *</label><input v-model="badgeForm.name" type="text" required /></div>
            <div class="form-group"><label>Descripción *</label><textarea v-model="badgeForm.description" required></textarea></div>
            <div class="form-group"><label>Nivel *</label><input v-model.number="badgeForm.level" type="number" min="1" required /></div>
            <div class="form-group"><label>Condición *</label><input v-model.number="badgeForm.condition" type="number" min="1" required /></div>
            <div class="form-group"><label>Icono *</label><input v-model="badgeForm.icon" type="text" required /></div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Guardar</button>
              <button type="button" class="btn-secondary" @click="showBadgeForm = false">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- TAB: Rewards -->
    <div v-if="tab === 'rewards'" class="tab-content">
      <div class="card">
        <div class="card-header">
          <h2>Recompensas</h2>
          <button class="btn-primary" @click="showRewardForm = true">+ Nueva Recompensa</button>
        </div>
        <div class="card-body">
          <div v-if="store.rewardStats" class="stats-row">
            <div class="stat"><strong>Activas:</strong> {{ store.rewardStats.active_rewards }}</div>
            <div class="stat"><strong>Canjes pendientes:</strong> {{ store.rewardStats.pending_redemptions }}</div>
            <div class="stat"><strong>Créditos usados:</strong> S/ {{ store.rewardStats.total_credits_used }}</div>
          </div>
          <table v-if="store.rewards.length" class="table">
            <thead><tr><th>Nombre</th><th>Costo</th><th>Stock</th><th>Estado</th><th>Canjes</th><th>Acciones</th></tr></thead>
            <tbody>
              <tr v-for="reward in store.rewards" :key="reward.id">
                <td>{{ reward.name }}</td><td>S/ {{ reward.cost }}</td><td>{{ reward.stock ?? 'Ilimitado' }}</td>
                <td><span :class="reward.active ? 'badge-active' : 'badge-inactive'">{{ reward.active ? 'Activo' : 'Inactivo' }}</span></td>
                <td>{{ reward.redemption_count || 0 }}</td>
                <td>{{ reward.name }}</td><td>S/ {{ reward.cost }}</td><td>{{ reward.stock ?? 'Ilimitado' }}</td>
                <td><span :class="reward.active ? 'badge-active' : 'badge-inactive'">{{ reward.active ? 'Activo' : 'Inactivo' }}</span></td>
                <td>{{ reward.redemption_count || 0 }}</td>
                <td>
                  <button class="btn-sm" @click="editReward(reward)">Editar</button>
                  <button v-if="reward.deleted_at" class="btn-sm" @click="restoreRewardItem(reward.id)">Restaurar</button>
                  <button v-else class="btn-sm btn-danger" @click="deleteRewardItem(reward.id)">Eliminar</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty">No hay recompensas</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h2>Canjes Pendientes</h2></div>
        <div class="card-body">
          <div v-if="store.pendingRedemptions.length" v-for="r in store.pendingRedemptions" :key="r.id" class="redemption-item">
            <p><strong>{{ r.reward_name }}</strong> - {{ r.user_name }} - S/ {{ r.cost }}</p>
            <div class="actions">
              <button class="btn-sm btn-success" @click="processRedemptionItem(r.id, 'processed')">Aprobar</button>
              <button class="btn-sm btn-danger" @click="processRedemptionItem(r.id, 'cancelled')">Rechazar</button>
            </div>
          </div>
          <p v-else class="empty">No hay canjes pendientes</p>
        </div>
      </div>

      <div v-if="showRewardForm" class="modal">
        <div class="modal-content">
          <h3>{{ editingReward ? 'Editar Recompensa' : 'Nueva Recompensa' }}</h3>
          <form @submit.prevent="saveReward">
            <div class="form-group"><label>Nombre *</label><input v-model="rewardForm.name" type="text" required /></div>
            <div class="form-group"><label>Descripción *</label><textarea v-model="rewardForm.description" required></textarea></div>
            <div class="form-group"><label>Costo (S/) *</label><input v-model.number="rewardForm.cost" type="number" step="0.01" min="0" required /></div>
            <div class="form-group"><label>Stock (vacío = ilimitado)</label><input v-model="rewardForm.stock" type="number" min="0" /></div>
            <div class="form-group"><label>Imagen URL *</label><input v-model="rewardForm.image" type="text" required /></div>
            <div class="form-group"><label><input v-model="rewardForm.active" type="checkbox" /> Activo</label></div>
            <div class="form-actions">
              <button type="submit" class="btn-primary">Guardar</button>
              <button type="button" class="btn-secondary" @click="showRewardForm = false">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- TAB: Config -->
    <div v-if="tab === 'config'" class="tab-content">
      <div class="card">
        <div class="card-header"><h2>Configuración de Puntos</h2></div>
        <div class="card-body">
          <div v-for="cfg in store.configs" :key="cfg.id" class="config-row">
            <div class="form-group"><label>Curso Aprobado</label><input v-model.number="cfg.passed_course" type="number" step="0.01" /></div>
            <div class="form-group"><label>Pregunta Diaria</label><input v-model.number="cfg.daily_question" type="number" step="0.01" /></div>
            <div class="form-group"><label>Logro</label><input v-model.number="cfg.achievement" type="number" step="0.01" /></div>
            <button class="btn-primary" @click="saveConfigItem(cfg.id, cfg)">Guardar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Modal & Toast -->
    <ConfirmModal
      :visible="confirm.showConfirm.value"
      :title="confirm.confirmData.value.title"
      :message="confirm.confirmData.value.message"
      :confirm-text="confirm.confirmData.value.confirmText"
      :type="confirm.confirmData.value.type"
      :loading="confirm.confirmLoading.value"
      @confirm="confirm.onConfirm"
      @cancel="confirm.onCancel"
    />
    <ToastNotification
      :toast="toastAlert.toast.value"
      @close="toastAlert.dismiss"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGamificationStore } from '../stores/gamificationStore'
import ConfirmModal from '../components/ConfirmModal.vue'
import ToastNotification from '../components/ToastNotification.vue'
import { useConfirm } from '../composables/useConfirm'
import { useToast } from '../composables/useToast'

const store = useGamificationStore()
const tab = ref('ranking')

const confirm = useConfirm()
const toastAlert = useToast()

const showLevelForm = ref(false)
const editingLevel = ref(null)
const levelForm = ref({ description: '', experience_required: 0, url_icon: '' })

const showBadgeForm = ref(false)
const editingBadge = ref(null)
const badgeForm = ref({ name: '', description: '', level: 1, condition: 1, icon: '' })

const showRewardForm = ref(false)
const editingReward = ref(null)
const rewardForm = ref({ name: '', description: '', cost: 0, stock: null, image: '', active: true })

function editLevel(level) {
  editingLevel.value = level
  levelForm.value = { description: level.description, experience_required: level.experience_required, url_icon: level.url_icon || '' }
  showLevelForm.value = true
}

async function saveLevel() {
  if (editingLevel.value) { await store.updateLevel(editingLevel.value.id, levelForm.value) }
  else { await store.createLevel(levelForm.value) }
  showLevelForm.value = false; editingLevel.value = null
  levelForm.value = { description: '', experience_required: 0, url_icon: '' }
}

function editBadge(badge) {
  editingBadge.value = badge
  badgeForm.value = { name: badge.name, description: badge.description, level: badge.level, condition: badge.condition, icon: badge.icon }
  showBadgeForm.value = true
}

async function saveBadge() {
  if (editingBadge.value) { await store.updateBadge(editingBadge.value.id, badgeForm.value) }
  else { await store.createBadge(badgeForm.value) }
  showBadgeForm.value = false; editingBadge.value = null
  badgeForm.value = { name: '', description: '', level: 1, condition: 1, icon: '' }
}

function editReward(reward) {
  editingReward.value = reward
  rewardForm.value = { name: reward.name, description: reward.description, cost: reward.cost, stock: reward.stock, image: reward.image, active: reward.active }
  showRewardForm.value = true
}

async function saveReward() {
  if (editingReward.value) { await store.updateReward(editingReward.value.id, rewardForm.value) }
  else { await store.createReward(rewardForm.value) }
  showRewardForm.value = false; editingReward.value = null
  rewardForm.value = { name: '', description: '', cost: 0, stock: null, image: '', active: true }
}

async function deleteRewardItem(id) {
  const ok = await confirm.show({
    title: 'Eliminar recompensa',
    message: '¿Eliminar recompensa? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    type: 'danger',
  })
  if (!ok) return
  await store.deleteReward(id)
  toastAlert.show('Eliminada', 'Recompensa eliminada correctamente', 'success')
}

async function restoreRewardItem(id) { await store.restoreReward(id) }
async function processRedemptionItem(id, status) { await store.processRedemption(id, { status }) }
async function saveConfigItem(id, data) { await store.saveConfig(id, { passed_course: data.passed_course, daily_question: data.daily_question, achievement: data.achievement }) }

onMounted(() => {
  store.fetchRanking(); store.fetchMyInfo(); store.fetchConfigs()
  store.fetchLevels(); store.fetchBadges(); store.fetchRewards()
  store.fetchRewardStats(); store.fetchRedemptions()
})
</script>

<style scoped>
.gamification { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
.page-header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; }
.tabs { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
.tabs button { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; font-size: 0.875rem; background: #fff; }
.tabs button.active { background: #2563eb; color: #fff; border-color: #2563eb; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 1.5rem; overflow: hidden; }
.card-header { padding: 1rem 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
.card-header h2 { font-size: 1.125rem; font-weight: 600; margin: 0; }
.card-body { padding: 1.5rem; }
.table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.table th, .table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.empty, .loading { text-align: center; padding: 2rem; color: #64748b; }
.progress-bar { height: 24px; background: #e2e8f0; border-radius: 12px; position: relative; margin: 1rem 0; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #2563eb, #3b82f6); border-radius: 12px; }
</style>
