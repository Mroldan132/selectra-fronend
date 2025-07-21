<template>
    <v-container fluid>
        <v-card class="elevation-2 rounded-lg">
            <v-toolbar flat color="white">
                <v-toolbar-title class="font-weight-bold text-grey-darken-2">
                    <v-icon class="mr-2">mdi-format-list-bulleted</v-icon>
                    Gesti�n de Opciones de Pregunta Filtro
                </v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-spacer></v-spacer>
                <v-btn color="primary" dark class="mb-2" @click="abrirModalNuevo">
                    <v-icon left class="mr-2">mdi-plus-circle-outline</v-icon>
                    Nueva Opci�n
                </v-btn>
            </v-toolbar>

            <v-card-text>
                <v-text-field v-model="search"
                              append-inner-icon="mdi-magnify"
                              label="Buscar opci�n..."
                              variant="outlined"
                              density="compact"
                              hide-details />
            </v-card-text>

            <v-data-table :headers="headers"
                          :items="opciones"
                          :search="search"
                          :loading="loading"
                          loading-text="Cargando datos..."
                          no-data-text="No se encontraron opciones"
                          class="elevation-0">
                <template v-slot:item.actions="{ item }">
                    <v-icon small class="mr-2" color="blue" @click="abrirModalEditar(item)">mdi-pencil</v-icon>
                    <v-icon small color="red" @click="eliminarOpcion(item)">mdi-delete</v-icon>
                </template>
            </v-data-table>
        </v-card>

        <OpcionPreguntaFiltroModal :visible="dialogVisible"
                                   :opcion-para-editar="opcionSeleccionada"
                                   :modo-editar="modoEditar"
                                   @cerrar="cerrarModal"
                                   @guardado="handleGuardado" />

        <v-snackbar v-model="snackbar.show"
                    :color="snackbar.color"
                    timeout="4000"
                    location="top right">
            {{ snackbar.text }}
            <template #actions>
                <v-btn icon="mdi-close" variant="text" @click="snackbar.show = false"></v-btn>
            </template>
        </v-snackbar>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import OpcionPreguntaFiltroService from "@/services/OpcionPreguntaFiltroService";
import OpcionPreguntaFiltroModal from "@/components/OpcionPreguntaFiltro/OpcionPreguntaFiltroModal.vue";

const loading = ref(true);
const search = ref("");
const opciones = ref([]);

const dialogVisible = ref(false);
const modoEditar = ref(false);
const opcionSeleccionada = ref(null);

const snackbar = ref({ show: false, text: "", color: "success" });

const headers = [
    { title: "ID", key: "opcionPreguntaId" },
    { title: "Texto Opci�n", key: "textoOpcion" },
    { title: "Orden", key: "orden" },
    { title: "ID Pregunta Filtro", key: "preguntaFiltroId" },
    { title: "Acciones", key: "actions", sortable: false }
];

const fetchOpciones = async () => {
    loading.value = true;
    try {
        opciones.value = await OpcionPreguntaFiltroService.obtenerOpcionesPreguntaFiltro();
    } catch (error) {
        console.error("Error al obtener opciones:", error);
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
    opcionSeleccionada.value = null;
    dialogVisible.value = true;
};

const abrirModalEditar = (item) => {
    modoEditar.value = true;
    opcionSeleccionada.value = { ...item };
    dialogVisible.value = true;
};

const cerrarModal = () => {
    dialogVisible.value = false;
    opcionSeleccionada.value = null;
};

const handleGuardado = () => {
    cerrarModal();
    const message = modoEditar.value
        ? "Opci�n actualizada correctamente."
        : "Opci�n creada correctamente.";
    showSnackbar(message);
    fetchOpciones();
};

const eliminarOpcion = async (item) => {
    if (confirm(`�Est� seguro de eliminar la opci�n "${item.textoOpcion}"?`)) {
        try {
            await OpcionPreguntaFiltroService.eliminarOpcionPreguntaFiltro(item.opcionPreguntaId);
            showSnackbar("Opci�n eliminada correctamente.");
            fetchOpciones();
        } catch (error) {
            console.error("Error al eliminar opci�n:", error);
            showSnackbar(error.message || "Error al eliminar la opci�n.", "error");
        }
    }
};

onMounted(fetchOpciones);
</script>
