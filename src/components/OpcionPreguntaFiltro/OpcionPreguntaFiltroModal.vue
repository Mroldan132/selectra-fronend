<template>
    <v-dialog :model-value="visible" persistent max-width="500px">
        <v-card :loading="loadingForm" class="rounded-lg">
            <v-toolbar :color="modoEditar ? 'warning' : 'primary'" dark flat>
                <v-toolbar-title>
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
                    <v-alert v-if="errorForm" type="error" dense text class="mb-4">
                        {{ errorForm }}
                    </v-alert>

                    <v-text-field
                        v-model="formData.textoOpcion"
                        label="Texto de la Opción"
                        :rules="[rules.required, rules.maxLength(500)]"
                        variant="outlined"
                        density="comfortable"
                        counter="500"
                        class="mb-4"
                    />

                    <v-text-field
                        v-model.number="formData.orden"
                        type="number"
                        label="Orden"
                        :rules="[rules.nonNegative]"
                        variant="outlined"
                        density="comfortable"
                        class="mb-4"
                    />

                    <v-select
                        v-model="formData.preguntaFiltroId"
                        :items="preguntasFiltros"
                        item-title="textoPregunta"
                        item-value="preguntaFiltroId"
                        label="Pregunta Filtro Asociada"
                        :rules="[rules.required]"
                        variant="outlined"
                        density="comfortable"
                    />
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
import { ref, reactive, watch, computed, onMounted } from "vue";
import OpcionPreguntaFiltroService from "@/services/OpcionPreguntaFiltroService";
import PreguntasFiltrosService from "@/services/PreguntasFiltrosService";

const props = defineProps({
    visible: Boolean,
    opcionParaEditar: Object,
    modoEditar: Boolean
});

const emit = defineEmits(["cerrar", "guardado"]);

const loadingForm = ref(false);
const errorForm = ref("");
const formRef = ref(null);
const preguntasFiltros = ref([]);

const getInitialData = () => ({
    opcionPreguntaId: 0,
    textoOpcion: "",
    orden: 0,
    preguntaFiltroId: null
});

const formData = reactive(getInitialData());

const tituloModal = computed(() =>
    props.modoEditar ? "Editar Opción de Pregunta" : "Nueva Opción de Pregunta"
);

const rules = {
    required: (value) => !!value || "Este campo es requerido.",
    maxLength: (length) => (value) => !value || value.length <= length || `Máximo ${length} caracteres.`,
    nonNegative: (value) => value === null || value === undefined || value >= 0 || "Debe ser un número positivo o cero."
};

const guardar = async () => {
    if (!formRef.value) return;
    const { valid } = await formRef.value.validate();

    if (valid) {
        loadingForm.value = true;
        errorForm.value = "";
        try {
            if (props.modoEditar) {
                await OpcionPreguntaFiltroService.actualizarOpcionPreguntaFiltro(formData);
            } else {
                await OpcionPreguntaFiltroService.crearOpcionPreguntaFiltro(formData);
            }
            emit("guardado");
        } catch (error) {
            errorForm.value = error.message || "Ocurrió un error al guardar.";
            console.error(error);
        } finally {
            loadingForm.value = false;
        }
    }
};

const cerrar = () => {
    if (loadingForm.value) return;
    emit("cerrar");
};

const cargarPreguntas = async () => {
    try {
        preguntasFiltros.value = await PreguntasFiltrosService.obtenerPreguntasFiltros();
    } catch (error) {
        console.error("Error al cargar las preguntas filtro:", error);
        errorForm.value = "No se pudieron cargar las preguntas necesarias.";
    }
};

watch(
    () => props.visible,
    (newVal) => {
        if (newVal) {
            // Resetear estado cuando el modal se abre
            errorForm.value = "";
            formRef.value?.resetValidation();
            if (props.modoEditar && props.opcionParaEditar) {
                Object.assign(formData, props.opcionParaEditar);
            } else {
                Object.assign(formData, getInitialData());
            }
        }
    }
);

onMounted(() => {
    cargarPreguntas();
});
</script>