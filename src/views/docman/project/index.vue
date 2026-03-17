<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true">
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType">
        <el-select v-model="queryParams.customerType" placeholder="全部" clearable>
          <el-option label="电信" value="telecom" />
          <el-option label="社会客户" value="social" />
        </el-select>
      </el-form-item>
      <el-form-item label="业务类型" prop="businessType">
        <el-select v-model="queryParams.businessType" placeholder="全部" clearable>
          <el-option label="管线" value="pipeline" />
          <el-option label="弱电" value="weak_current" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">搜索</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" @click="handleAdd" v-hasPermi="['docman:project:add']">新增项目</el-button>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="item in projectList" :key="item.id">
        <el-card shadow="hover" class="project-card" style="margin-bottom: 16px; cursor: pointer;" @click="handleDetail(item.id)">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold;">{{ item.name }}</span>
              <el-tag :type="item.status === 'archived' ? 'success' : 'primary'" size="small">
                {{ item.status === 'archived' ? '已归档' : '进行中' }}
              </el-tag>
            </div>
          </template>
          <p>客户：{{ item.customerType === 'telecom' ? '电信' : '社会客户' }}</p>
          <p>类型：{{ item.businessType === 'pipeline' ? '管线' : '弱电' }}</p>
          <p>负责人：{{ item.ownerName }}</p>
          <template #footer>
            <el-button size="small" @click.stop="handleDocuments(item.id)">文档中心</el-button>
            <el-button size="small" type="warning" @click.stop="handleProcess(item.id)">流程</el-button>
            <el-button size="small" type="success" v-if="item.status === 'active'" @click.stop="handleArchive(item.id)" v-hasPermi="['docman:archive:execute']">归档</el-button>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { listProject } from '@/api/docman/project';
import { archiveProject } from '@/api/docman/archive';
import { ElMessageBox, ElMessage } from 'element-plus';

const router = useRouter();
const projectList = ref<any[]>([]);
const total = ref(0);
const queryParams = ref({ pageNum: 1, pageSize: 12, name: '', customerType: '', businessType: '' });

function getList() {
  listProject(queryParams.value).then((res: any) => {
    projectList.value = res.rows;
    total.value = res.total;
  });
}
function handleQuery() { queryParams.value.pageNum = 1; getList(); }
function resetQuery() {
  queryParams.value = { pageNum: 1, pageSize: 12, name: '', customerType: '', businessType: '' };
  getList();
}
// TODO: 新增项目弹窗/页面
function handleAdd() { ElMessage.info('TODO: 新增项目'); }
function handleDetail(id: number) { router.push({ path: '/docman/document', query: { projectId: String(id) } }); }
function handleDocuments(id: number) { router.push({ path: '/docman/document', query: { projectId: String(id) } }); }
function handleProcess(id: number) { router.push({ path: '/docman/process', query: { projectId: String(id) } }); }
function handleArchive(id: number) {
  ElMessageBox.confirm('确认归档该项目？归档后不可修改。', '提示').then(() => {
    archiveProject(id).then(() => { ElMessage.success('归档成功'); getList(); });
  }).catch(() => {});
}

onMounted(() => getList());
</script>
