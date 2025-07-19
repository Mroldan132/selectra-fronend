<template>
    <v-dialog v-model="visibleLocal" persistent max-width="500px">
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

                    <v-text-field v-model="formData.textoOpcion"
                                  label="Texto de la Opción"
                                  :rules="[rules.required, rules.maxLength(500)]"
                                  variant="outlined"
                                  density="comfortable"
                                  counter="500" />

                    <v-text-field v-model="formData.orden"
                                  type="number"
                                  label="Orden"
                                  :rules="[rules.nonNegative]"
                                  variant="outlined"
                                  density="comfortable" />

                    <v-text-field v-model="formData.preguntaFiltroId"
                                  type="number"
                                  label="ID Pregunta Filtro"
                                  :rules="[rules.required]"
                                  variant="outlined"
                                  density="comfortable" />
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
import { ref, reactive, watch, computed } from "vue";
import OpcionPreguntaFiltroService from "@/services/OpcionPreguntaFiltroService";

const props = defineProps({
    visible: Boolean,
    opcionParaEditar: Object,
    modoEditar: Boolean
});
const emit = defineEmits(["cerrar", "guardado"]);

const visibleLocal = ref(props.visible);
const loadingForm = ref(false);
const errorForm = ref("");
const formRef = ref(null);

const getInitialData = () => ({
    opcionPreguntaId: 0,
    textoOpcion: "",
    orden: 0,
    preguntaFiltroId: null
});

const formData = reactive(getInitialData());

const tituloModal = computed(() =>
    props.modoEditar ? "Editar Opción de Pregunta Filtro" : "Nueva Opción de Pregunta Filtro"
);

const rules = {
    required: (value) => !!value || "Este campo es requerido.",
    maxLength: (length) => (value) => !value || value.length <= length || `Máximo ${length} caracteres.`,
    nonNegative: (value) => value >= 0 || "Debe ser un número positivo o cero."
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

watch(
    () => props.visible,
    (newVal) => {
        visibleLocal.value = newVal;
        if (newVal) {
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
</script>
