<template>
  <div class="app-container">
    <el-page-header @back="$router.back()">
      <template #content>文档中心</template>
    </el-page-header>

    <el-row :gutter="10" class="mb8" style="margin-top: 16px;">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Upload" @click="handleUpload" v-hasPermi="['docman:document:upload']">上传文档</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="documentList" style="margin-top: 16px;">
      <el-table-column prop="fileName" label="文件名" min-width="200" />
      <el-table-column prop="sourceType" label="来源" width="120">
        <template #default="{ row }">
          <el-tag :type="row.sourceType === 'plugin' ? 'primary' : 'info'" size="small">
            {{ row.sourceType === 'plugin' ? '插件生成' : '手动上传' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="nasPath" label="存储路径" min-width="250" show-overflow-tooltip />
      <el-table-column prop="generatedAt" label="生成时间" width="180" />
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="{ row }">
          <el-button
            v-hasPermi="['docman:document:download']"
            size="small"
            type="primary"
            link
            icon="Download"
            @click="handleDownload(row)"
          >下载</el-button>
          <el-button
            v-hasPermi="['docman:document:delete']"
            size="small"
            type="danger"
            link
            icon="Delete"
            @click="handleDelete(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 上传文档对话框 -->
    <el-dialog v-model="upload.open" :title="upload.title" width="400px" append-to-body @close="handleClose">
      <el-upload
        ref="uploadRef"
        :limit="1"
        accept=".pdf,.doc,.docx,.dwg"
        :http-request="submitUpload"
        :disabled="upload.isUploading"
        :auto-upload="false"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
            <span>仅允许导入 pdf, doc, docx, dwg 格式文件。</span>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFileForm" :loading="upload.isUploading" v-hasPermi="['docman:document:upload']">确 定</el-button>
          <el-button @click="upload.open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { listDocument, uploadDocument, deleteDocument } from '@/api/docman/document';
import { DocDocumentRecord, DocDocumentQuery, PageResult } from '@/api/docman/types';
import { ElMessage, ElMessageBox, UploadInstance, UploadRequestOptions } from 'element-plus';

const route = useRoute();
const projectId = ref(Number(route.query.projectId));
const documentList = ref<DocDocumentRecord[]>([]);
const total = ref(0);
const loading = ref(true);
const queryParams = ref<DocDocumentQuery>({ pageNum: 1, pageSize: 20 });

const uploadRef = ref<UploadInstance>();
const upload = reactive({
  open: false,
  title: '上传文档',
  isUploading: false
});

/** 查询文档列表 */
const getList = async () => {
  loading.value = true;
  const res = await listDocument(projectId.value, queryParams.value);
  documentList.value = res.data.rows;
  total.value = res.data.total;
  loading.value = false;
};

/** 下载按钮操作 */
const handleDownload = (row: DocDocumentRecord) => {
  window.open(`/api/docman/document/${row.id}/download`, '_blank');
};

/** 删除按钮操作 */
const handleDelete = async (row: DocDocumentRecord) => {
  try {
    await ElMessageBox.confirm(`确认删除文档「${row.fileName}」？`, '提示', {
      type: 'warning'
    });
    await deleteDocument(row.id);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    // 用户取消删除
  }
};

/** 上传按钮操作 */
function handleUpload() {
  upload.open = true;
}

/** 提交上传 */
async function submitUpload(options: UploadRequestOptions) {
  const formData = new FormData();
  formData.append('file', options.file);
  formData.append('projectId', String(projectId.value));
  
  upload.isUploading = true;
  try {
    await uploadDocument(formData);
    ElMessage.success('上传成功');
    upload.open = false;
    getList();
  } catch (error) {
    console.error('上传失败', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    upload.isUploading = false;
  }
}

function submitFileForm() {
  uploadRef.value?.submit();
}

/** 对话框关闭清理 */
function handleClose() {
  uploadRef.value?.clearFiles();
}

const statusTagType = (status: string): 'info' | 'success' | 'warning' | 'danger' | '' => {
  const map: Record<string, 'info' | 'success' | 'warning' | 'danger' | ''> = {
    draft: 'info',
    active: 'success',
    pending: 'warning',
    running: 'warning',
    failed: 'danger',
    obsolete: '',
    generated: 'primary',
    archived: 'success'
  };
  return map[status] ?? 'info';
};

function statusLabel(s: string) {
  const map: Record<string, string> = {
    draft: '草稿',
    active: '激活',
    pending: '待生成',
    running: '生成中',
    failed: '失败',
    obsolete: '作废',
    generated: '已生成',
    archived: '已归档'
  };
  return map[s] || s;
}

onMounted(() => getList());
</script>
