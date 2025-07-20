<template>
    <v-dialog v-model="visibleLocal" persistent max-width="500px">
        <v-card :loading="loadingForm" class="rounded-lg">
            <v-toolbar :color="modoEditar ? 'warning' : 'primary'" dark flat>
                <v-toolbar-title class="font-weight-medium">
                    <v-icon class="mr-2">{{ modoEditar ? 'mdi-pencil-box-outline' : 'mdi-plus-box-outline' }}</v-icon>
                    {{ tituloModal }}
                </v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="cerrar">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>

            <v-card-text class="pa-5">
                <v-form ref="formRef">
                    <v-alert v-if="errorForm" type="error" dense text class="mb-4">{{ errorForm }}</v-alert>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="formData.nombre"
                                          label="Nombre del Tipo de Pregunta Filtro"
                                          :rules="[rules.required, rules.maxLength(100)]"
                                          variant="outlined"
                                          density="comfortable"
                                          counter="100"></v-text-field>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn color="grey-darken-1" text @click="cerrar" :disabled="loadingForm">Cancelar</v-btn>
                <v-btn :color="modoEditar ? 'warning' : 'success'" @click="guardar" :loading="loadingForm">
                    Guardar
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
    import { ref, reactive, watch, computed } from 'vue';
    import TipoPreguntasFiltroService from '@/services/TipoPreguntasFiltroService';

    const props = defineProps({
        visible: Boolean,
        tipoPreguntaParaEditar: Object,
        modoEditar: Boolean,
    });
    const emit = defineEmits(['cerrar', 'guardado']);

    const visibleLocal = ref(props.visible);
    const loadingForm = ref(false);
    const errorForm = ref('');
    const formRef = ref(null);

    const getInitialData = () => ({
        tipoPreguntaId: 0,
        nombre: '',
    });

    const formData = reactive(getInitialData());

    const tituloModal = computed(() =>
        props.modoEditar ? 'Editar Tipo de Pregunta Filtro' : 'Nuevo Tipo de Pregunta Filtro'
    );

    const rules = {
        required: (value) => !!value || 'Este campo es requerido.',
        maxLength: (length) => (value) =>
            !value || value.length <= length || `Máximo ${length} caracteres.`,
    };

    const guardar = async () => {
        if (!formRef.value) return;
        const { valid } = await formRef.value.validate();

        if (valid) {
            loadingForm.value = true;
            errorForm.value = '';
            try {
                if (props.modoEditar) {
                    await TipoPreguntasFiltroService.actualizarTipoPregunta(formData);
                } else {
                    await TipoPreguntasFiltroService.crearTipoPregunta(formData);
                }
                emit('guardado');
            } catch (error) {
                errorForm.value = error.message || 'Ocurrió un error al guardar.';
                console.error(error);
            } finally {
                loadingForm.value = false;
            }
        }
    };

    const cerrar = () => {
        if (loadingForm.value) return;
        emit('cerrar');
    };

    watch(
        () => props.visible,
        (newVal) => {
            visibleLocal.value = newVal;
            if (newVal) {
                errorForm.value = '';
                formRef.value?.resetValidation();

                if (props.modoEditar && props.tipoPreguntaParaEditar) {
                    Object.assign(formData, props.tipoPreguntaParaEditar);
                } else {
                    Object.assign(formData, getInitialData());
                }
            }
        }
    );
</script>