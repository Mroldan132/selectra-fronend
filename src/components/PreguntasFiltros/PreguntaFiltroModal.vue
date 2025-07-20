<template>
    <v-dialog v-model="visibleLocal" persistent max-width="600px">
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
                    <v-alert v-if="errorForm" type="error" dense text class="mb-4">
                        {{ errorForm }}
                    </v-alert>
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="formData.textoPregunta"
                                          label="Texto de la Pregunta"
                                          :rules="[rules.required, rules.maxLength(200)]"
                                          variant="outlined"
                                          density="comfortable"
                                          counter="200">
                            </v-text-field>
                        </v-col>

                        <v-col cols="12">
                            <v-select v-model="formData.tipoPreguntaId"
                                      :items="tiposPregunta"
                                      item-title="nombre"
                                      item-value="tipoPreguntaId"
                                      label="Tipo de Pregunta"
                                      :rules="[rules.required]"
                                      variant="outlined"
                                      density="comfortable">
                            </v-select>
                        </v-col>

                        <v-col cols="12">
                            <v-switch v-model="formData.obligatoria"
                                      label="¿Obligatoria?"
                                      inset>
                            </v-switch>
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
    import { ref, reactive, watch, computed, onMounted } from "vue";
    import PreguntasFiltrosService from "@/services/PreguntasFiltrosService";
    import TipoPreguntasFiltroService from "@/services/TipoPreguntasFiltroService";

    const props = defineProps({
        visible: Boolean,
        preguntaFiltroParaEditar: Object, 
        modoEditar: Boolean,
    });

    const emit = defineEmits(["cerrar", "guardado"]);

    const visibleLocal = ref(props.visible);
    const loadingForm = ref(false);
    const errorForm = ref("");
    const formRef = ref(null);

    const tiposPregunta = ref([]); 

    const getInitialData = () => ({
        preguntaFiltroId: 0,
        textoPregunta: "",
        tipoPreguntaId: null,
        obligatoria: true,
    });

    const formData = reactive(getInitialData());

    const tituloModal = computed(() =>
        props.modoEditar ? "Editar Pregunta Filtro" : "Nueva Pregunta Filtro"
    );

    const rules = {
        required: (value) => !!value || "Este campo es requerido.",
        maxLength: (length) => (value) =>
            !value || value.length <= length || `Máximo ${length} caracteres.`,
    };

    const guardar = async () => {
        if (!formRef.value) return;
        const { valid } = await formRef.value.validate();

        if (valid) {
            loadingForm.value = true;
            errorForm.value = "";
            try {
                if (props.modoEditar) {
                    await PreguntasFiltrosService.actualizarPreguntaFiltro(formData);
                } else {
                    await PreguntasFiltrosService.crearPreguntaFiltro(formData);
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

    // ✅ Cargar tipos de preguntas al abrir el modal
    const cargarTiposPregunta = async () => {
        try {
            tiposPregunta.value = await TipoPreguntasFiltroService.obtenerTiposPregunta();
        } catch (error) {
            console.error("Error al cargar los tipos de pregunta:", error);
        }
    };

    watch(
        () => props.visible,
        (newVal) => {
            visibleLocal.value = newVal;
            if (newVal) {
                errorForm.value = "";
                formRef.value?.resetValidation();
                cargarTiposPregunta();

                if (props.modoEditar && props.preguntaFiltroParaEditar) {
                    Object.assign(formData, props.preguntaFiltroParaEditar);
                } else {
                    Object.assign(formData, getInitialData());
                }
            }
        }
    );

    onMounted(cargarTiposPregunta);
</script>

