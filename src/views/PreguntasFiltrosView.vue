<template>
    <v-container fluid>
        <v-card class="elevation-2 rounded-lg">
            <v-toolbar flat color="white">
                <v-toolbar-title class="font-weight-bold text-grey-darken-2">
                    <v-icon class="mr-2">mdi-form-textbox</v-icon>
                    Gestión de Preguntas Filtro
                </v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-btn color="primary" dark class="mb-2" @click="abrirModalNuevo">
                    <v-icon left class="mr-2">mdi-plus-circle-outline</v-icon>
                    Nueva Pregunta
                </v-btn>
            </v-toolbar>

            <v-card-text>
                <v-text-field v-model="search"
                              append-inner-icon="mdi-magnify"
                              label="Buscar pregunta..."
                              variant="outlined"
                              density="compact"
                              hide-details></v-text-field>
            </v-card-text>

            <v-data-table :headers="headers"
                          :items="preguntasFiltro"
                          :search="search"
                          :loading="loading"
                          loading-text="Cargando datos..."
                          no-data-text="No se encontraron preguntas"
                          class="elevation-0">
                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" @click="abrirModalEditar(item)" color="blue" title="Editar">
                        mdi-pencil
                    </v-icon>
                    <v-icon small color="red" @click="eliminarPregunta(item)" title="Eliminar">
                        mdi-delete
                    </v-icon>
                </template>
            </v-data-table>
        </v-card>

        <!-- Modal -->
        <PreguntaFiltroModal :visible="dialogVisible"
                             :pregunta-filtro-para-editar="preguntaSeleccionada"
                             :modo-editar="modoEditar"
                             @cerrar="cerrarModal"
                             @guardado="handleGuardado" />

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show"
                    :color="snackbar.color"
                    timeout="4000"
                    location="top right"
                    variant="elevated">
            {{ snackbar.text }}
            <template #actions>
                <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false"></v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script setup>
    import { ref, onMounted } from "vue";
    import PreguntaFiltroModal from "@/components/PreguntasFiltros/PreguntaFiltroModal.vue";
    import PreguntasFiltrosService from "@/services/PreguntasFiltrosService";

    const loading = ref(true);
    const search = ref("");
    const preguntasFiltro = ref([]);

    const dialogVisible = ref(false);
    const modoEditar = ref(false);
    const preguntaSeleccionada = ref(null);

    const snackbar = ref({ show: false, text: "", color: "success" });

    const headers = ref([
        { title: "ID", key: "preguntaFiltroId", align: "start" },
        { title: "Texto Pregunta", key: "textoPregunta" },
        { title: "Tipo Pregunta", key: "nombreTipoPregunta" },
        { title: "Obligatoria", key: "obligatoria" },
        { title: "Fecha Creación", key: "fechaCreacion" },
        { title: "Acciones", key: "actions", sortable: false, align: "end" },
    ]);

    const fetchPreguntasFiltro = async () => {
        loading.value = true;
        try {
            preguntasFiltro.value = await PreguntasFiltrosService.obtenerPreguntasFiltros();
        } catch (error) {
            console.error("Error al obtener las preguntas filtro:", error);
            showSnackbar("Error al cargar los datos", "error");
        } finally {
            loading.value = false;
        }
    };

    const showSnackbar = (text, color = "success") => {
        snackbar.value = { show: true, text, color };
    };

    const abrirModalNuevo = () => {
        modoEditar.value = false;
        preguntaSeleccionada.value = null;
        dialogVisible.value = true;
    };

    const abrirModalEditar = (item) => {
        modoEditar.value = true;
        preguntaSeleccionada.value = { ...item };
        dialogVisible.value = true;
    };

    const cerrarModal = () => {
        dialogVisible.value = false;
        preguntaSeleccionada.value = null;
    };

    const handleGuardado = () => {
        cerrarModal();
        const message = modoEditar.value
            ? "Pregunta filtro actualizada correctamente."
            : "Pregunta filtro creada correctamente.";
        showSnackbar(message);
        fetchPreguntasFiltro();
    };

    const eliminarPregunta = async (item) => {
        if (confirm(`¿Está seguro de eliminar la pregunta "${item.textoPregunta}"?`)) {
            try {
                await PreguntasFiltrosService.eliminarPreguntaFiltro(item.preguntaFiltroId);
                showSnackbar("Pregunta filtro eliminada correctamente.");
                fetchPreguntasFiltro();
            } catch (error) {
                console.error("Error al eliminar la pregunta filtro:", error);
                showSnackbar(error.message || "Error al eliminar la pregunta filtro.", "error");
            }
        }
    };

    onMounted(fetchPreguntasFiltro);
</script>
