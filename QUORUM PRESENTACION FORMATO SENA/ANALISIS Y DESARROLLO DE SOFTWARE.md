		ANALISIS Y DESARROLLO DE SOFTWARE
ESPECIFICACIÓN DE REQUERIMIENTOS DEL SOFTWARE









Andrés Felipe Orozco Piedrahita
Ficha: 2929061-B



Instructores:
Oscar Aristizabal (Instructor y Gestor de ficha)
Carlos Loaiza (Instructor)
Jose Estrada(Instructor)





Nombre del proyecto:
Sistema de Información para la Gestión de Asistencia y Automatización de Formatos Académicos
(QUORUM)



	




SERVICIO NACIONAL DE APRENDIZAJE (SENA)
CENTRO DE PROCESOS INDUSTRIALES Y CONSTRUCCION (CPIC)
ANALISIS Y DESARROLLO DE SOFTWARE(ADSO)
ETAPA PRACTICA
FORMACION PRESENCIAL (JORNADA NOCTURNA)
FECHA DE ENTREGA: 10 DE ABRIL DE 2026





FICHA DEL DOCUMENTO: 

FECHA	REVISIÓN(ES)	AUTOR(ES)
12/02/2026	Versión 1.0 - Creación del Documento y levantamiento inicial	Andrés Felipe Orozco Piedrahita
19/02/2026	Ajuste de alcance (MVP), inclusión de roles y referencias	Andrés Felipe Orozco Piedrahita
		

DOCUMENTO VALIDADO POR LAS PARTES EN FECHA: 

POR CLIENTE: SENA	DESARROLLADOR: Andres Felipe Orozco Piedrahita
FECHA: 19 DE FEBRERO DE 2026	FECHA: 19 DE FEBRERO DE 2026
NOMBRE DEL ENCARGADO: Jose German Estrada Clavijo	NOMBRE DEL ENCARGADO: Andres Felipe Orozco Piedrahita



































FICHA DEL DOCUMENTO

CONTENIDO

1.	INTRODUCCION
1.1.	OBJETIVO GENERAL
1.2.	OBJETIVOS ESPECIFICOS
1.3.	PROPOSITO
1.4.	ALCANCE
1.5.	PERSONAL INVOLUCRADO
1.6.	DEFINICIONES, ACRONIMOS Y ABREVIATURAS
1.7.	REFERENCIAS
1.8.	RESUMEN
2.	DESCRIPCION GENERAL
2.1.	PERSPECTIVA DEL PRODUCTO
2.2.	FUNCIONALIDADES DEL PRODUCTO 
2.3.	CARACTERISTICAS DE LOS USUARIOS 
2.4.	RESTRICCIONES
3.	REQUISITOS ESPECIFICOS
3.1.	REQUISITOS DEL SISTEMA
3.2.	REQUISITOS FUNCIONALES (DIAGRAMAS FUNCIONALES)
3.3.	REQUISITOS NO FUNCIONALES (DIAGRAMAS NO FUNCIONALES)
4.	VALIDACIÓN DE REQUISITOS
4.1.	CONSTRUCCIÓN DE PROTOTIPOS
4.2.	FORMATO DE CASO DE PRUEBA

























1.	INTRODUCCION

El control de asistencia en los procesos formativos es un requisito fundamental para garantizar la permanencia y certificación de los aprendices. Actualmente, este proceso se realiza de manera manual o dispersa, lo que conlleva errores en el conteo de horas, pérdida de información física y, sobre todo, un re-proceso tedioso al momento de transcribir estos datos a los formatos institucionales oficiales del SENA. Este proyecto surge de la necesidad de optimizar este flujo, permitiendo que la toma de asistencia diaria alimente automáticamente los informes finales requeridos.

1.1.	OBJETIVO GENERAL

Desarrollar un sistema de información web llamado QUORUM que permita a los instructores registrar la asistencia diaria de los aprendices y genere automáticamente el "Formato de Control de Inasistencias y Reporte de Deserción" diligenciado, listo para su entrega.

1.2.	OBJETIVOS ESPECIFICOS

•	Digitalizar el proceso de toma de asistencia diaria para eliminar el uso de papel y listas manuales.

•	Habilitar un portal de consulta para que el Aprendiz pueda visualizar sus fallas acumuladas y mantener un control personal.

•	Proveer al Coordinador Académico de una vista general para monitorear el cumplimiento de la asistencia en las diferentes fichas.



•	Diseñar un módulo de reportes que exporte la información consolidada directamente en la plantilla oficial del SENA (Excel), lista para firma y entrega.





1.3.	PROPOSITO

La finalidad del software es servir como una herramienta de agilidad administrativa. Busca eliminar la carga operativa de transcribir manualmente las asistencias a fin de mes. El propósito es simple: lo que el instructor marca en el sistema día a día, aparece ya organizado en el formato final.


1.4.	ALCANCE

El software QUORUM abarcará exclusivamente las siguientes funciones:

•	Gestión de Usuarios: Acceso mediante roles (Instructor, Aprendiz, Coordinador).

•	Gestión de Fichas: Listado de estudiantes vinculados a un grupo.

•	Registro de Asistencia: Marcar "Asistió", "Falla" o "Excusa" diariamente.


•	Generación del Documento: Creación del archivo final (Formato SENA) con encabezados, fechas y datos de aprendices diligenciados.

•	No incluye: Gestión de calificaciones, planes de mejoramiento académico, generación de alertas predictivas complejas ni integración directa con SofiaPlus en tiempo real.


1.5.	PERSONAL INVOLUCRADO

NOMBRE	JOSE GERMAN ESTRADA CLAVIJO
ROL	INSTRUCTOR
PROFESION	Ingeniero de Sistemas
RESPONSABILIDADES	Impartir formación, gestión documental y gestión administrativa.
INFORMACION DE CONTACTO	gestradac@sena.edu.co
APRUEBA	SI


	
NOMBRE	SANTIAGO BECERRA HENAO
ROL	COORDINADOR ACADEMICO
PROFESION	Ingeniero de Sistemas
RESPONSABILIDADES	Impartir formación, gestión documental y gestión administrativa.
INFORMACION DE CONTACTO	sbecerra@sena.edu.co
APRUEBA	SI

	
	

1.6.	DEFINICIONES, ACRONIMOS Y ABREVIATURAS

•	ADSO: Análisis y Desarrollo de Software.
•	Ficha: Código numérico que identifica a un grupo de aprendices en el SENA.
•	QUORUM: Nombre del aplicativo.



1.7.	REFERENCIAS

•	Additio App (España/Global): Es un "cuaderno de notas" digital multiplataforma. Permite a los docentes llevar control de asistencia y generar reportes en Excel. Es el referente principal en cuanto a usabilidad (UX) para el módulo del Instructor en QUORUM, demostrando la eficiencia de reemplazar el papel por interfaces táctiles rápidas.

•	iDoceo (iOS): Aplicación líder en el mercado de gestión de aula. Permite configurar columnas de asistencia con iconos personalizados (retrasos, faltas, excusas). Se referencia para la lógica de cálculo de porcentajes de asistencia que implementará QUORUM.


•	Phidias: Software de gestión escolar premium utilizado en colegios de alto nivel en Colombia. Integra módulos de comunicación y seguimiento. Se toma como referencia por su interfaz intuitiva para la visualización de fallas por parte de padres y alumnos.


1.8.	RESUMEN

El software QUORUM se utiliza para modernizar la tarea del instructor al pasar lista. En lugar de usar una hoja de papel, el instructor ingresa al sistema web y marca las novedades del día. Los aprendices pueden iniciar sesión desde sus casas para ver cuántas fallas llevan acumuladas. Por su parte, el coordinador puede revisar qué fichas tienen baja asistencia. Al finalizar el periodo, el instructor usa el sistema para exportar y "llenar" automáticamente el formato de inasistencias en Excel que exige la institución.
________________________________________




2.	DESCRIPCION GENERAL

El sistema funciona de manera práctica y centralizada. Reemplaza las hojas de cálculo individuales de cada docente por una base de datos única donde interactúan los tres roles clave de la formación.

2.1.	PERSPECTIVA DEL PRODUCTO


El sistema QUORUM es una aplicación web diseñada para ser rápida e intuitiva. Su interfaz gráfica es minimalista y se adapta tanto a computadores de escritorio como a teléfonos móviles (diseño responsivo), permitiendo que se pueda usar directamente en el ambiente de formación.
La forma en que el usuario interactúa con el sistema cambia dependiendo de su rol:

•	Instructor (Rol Operativo): Al iniciar sesión, ve un panel con sus Fichas asignadas. Interactúa principalmente con una lista de estudiantes tipo "Checklist", donde con un solo clic marca si el aprendiz asistió, faltó o tiene excusa. También tiene acceso al botón para descargar el formato SENA generado automáticamente.

•	Aprendiz (Rol de Consulta): Tiene una interfaz de solo lectura. Al ingresar, visualiza una tarjeta de resumen personal ("Mi Historial") que le muestra claramente cuántas fallas lleva acumuladas y en qué fechas ocurrieron. El sistema bloquea cualquier intento de edición por parte del aprendiz.

•	Coordinador Académico (Rol Auditor): Accede a una pantalla de monitoreo con un buscador. Puede buscar cualquier número de Ficha para ver la lista de asistencia general y detectar qué estudiantes están faltando mucho, pero no puede alterar los registros que hizo el instructor.



2.2.	FUNCIONALIDADES DEL PRODUCTO 

1.	Autenticación Multi-rol: Login único que redirige al usuario a su panel correspondiente según su perfil.

2.	Módulo Instructor: Interfaz de toma de asistencia diaria y botón de descarga de reportes.


3.	Módulo Aprendiz: Visualización del historial de inasistencias personales.


4.	Módulo Coordinador: Tablero de control de lectura para auditar la asistencia de cualquier ficha del centro.


5.	Generador de Formato: Algoritmo que inyecta los datos guardados en la base de datos dentro de la plantilla oficial de Excel del CPIC.



2.3.	CARACTERISTICAS DE LOS USUARIOS 


Se definen perfiles claros según las funciones de la persona en el proceso formativo:

•	INSTRUCTOR: Busca rapidez y eficiencia. No desea realizar configuraciones complejas; su prioridad es registrar el dato en la clase y obtener el documento a fin de mes sin re-trabajo.

•	APRENDIZ: Usuario móvil. Ingresa esporádicamente para verificar que sus asistencias estén correctamente reportadas y llevar su control para no incurrir en deserción.


•	COORDINADOR ACADÉMICO: Perfil administrativo. Necesita información veraz y consolidada de todas las fichas para tomar decisiones o realizar seguimientos, sin necesidad de pedirle la lista física al instructor.


2.4.	RESTRICCIONES


Esta sección define los límites operativos del sistema y las reglas de negocio estrictas sobre lo que NO se debe hacer o lo que el sistema bloqueará por seguridad, detallando los permisos y prohibiciones según el rol de cada usuario:

A.	Restricciones a Nivel de Sistema:

•	Sin Integración Externa: El sistema no se conectará en tiempo real ni modificará bases de datos nacionales como SofiaPlus o territoriales. Funcionará de manera independiente con su propia base de datos local/nube.
•	Inmutabilidad del Formato: El diseño del documento Excel exportado (Control de Inasistencias y Reporte de Deserción CPIC) está bloqueado por código. Ningún usuario podrá cambiar desde el sistema los logos del SENA, los títulos institucionales ni la disposición de las columnas, garantizando que el reporte siempre cumpla la norma.
•	Exclusión Académica: El software está estrictamente restringido a la asistencia. No existen, ni se permitirán crear, campos para ingresar notas, calificaciones o juicios evaluativos.
B.	Restricciones por Rol de Usuario (Permitido vs. No Permitido):

1.	Rol APRENDIZ:

•	Permitido: Iniciar sesión, visualizar su tarjeta de perfil, consultar su propio historial de inasistencias por fecha y ver el acumulado total de sus fallas.

•	NO Permitido (Bloqueado):
o	Bajo ninguna circunstancia puede editar, borrar o justificar sus propias fallas en el sistema.
o	No tiene permitido buscar, visualizar ni acceder a la información, asistencia o datos personales de otros compañeros de su misma ficha ni de fichas externas (Aislamiento de datos).


2.	Rol INSTRUCTOR:

•	Permitido: Visualizar únicamente las Fichas que le han sido asignadas, tomar asistencia diaria, registrar excusas y descargar el reporte oficial en Excel de sus grupos.

•	NO Permitido (Bloqueado):
o	No tiene permitido visualizar ni modificar la asistencia de Fichas que pertenecen a otros instructores.

3.	Rol COORDINADOR ACADÉMICO:

•	Permitido: Buscar cualquier Ficha activa en el centro, visualizar la matriz general de asistencia de todos los instructores y descargar reportes globales para auditoría.

•	NO Permitido (Bloqueado):
o	Es un rol estrictamente de solo lectura. No tiene permitido "pasar lista", marcar asistencias, ni alterar los registros diarios que ya fueron ingresados por el instructor responsable del grupo. Su función es auditar, no operar.

4.	Rol ADMINISTRADOR (Soporte/Desarrollador):

•	Permitido: Creación de usuarios (Instructores/Coordinadores), creación de Fichas, asignación de cargas y mantenimiento de la base de datos.
•	NO Permitido (Bloqueado):
o	No debe registrar asistencias diarias en nombre de los instructores ni alterar los conteos de fallas de los aprendices directamente desde la interfaz, respetando la autoridad del docente sobre su grupo.



3.	REQUISITOS ESPECIFICOS



3.1.	REQUISITOS DEL SISTEMA

•	Servidor Local: …
•	Base de Datos: MySQL.
•	Frontend: HTML5, CSS3, JS.
•	Backend: PHP.










3.2.	REQUISITOS FUNCIONALES

IDENTIFICACION DEL REQUERIMIENTO	RF-01
NOMBRE DEL REQUERIMIENTO	Inicio de Sesión Seguro
CARACTERISTICAS	Validación de credenciales y roles.
DESCRIPCION DEL REQUERIMIENTO	El sistema validará usuario/contraseña y redirigirá a la vista correspondiente (Instructor, Aprendiz o Coordinador).
REQUERIMIENTO NO FUNCIONAL	
PRIORIDAD DEL REQUERIMIENTO	ALTA


IDENTIFICACION DEL REQUERIMIENTO	RF-02
NOMBRE DEL REQUERIMIENTO	Registro de Asistencia (Instructor)
CARACTERISTICAS	CRUD de novedades diarias.
DESCRIPCION DEL REQUERIMIENTO	(se describe como es la función del requerimiento)
REQUERIMIENTO NO FUNCIONAL	
PRIORIDAD DEL REQUERIMIENTO	ALTA


IDENTIFICACION DEL REQUERIMIENTO	RF-03
NOMBRE DEL REQUERIMIENTO	Consulta de Historial (Aprendiz)
CARACTERISTICAS	Visualización personal.
DESCRIPCION DEL REQUERIMIENTO	El Aprendiz podrá ingresar y ver una tabla con sus días asistidos y fallados, junto con un contador total de horas de inasistencia.
REQUERIMIENTO NO FUNCIONAL	
PRIORIDAD DEL REQUERIMIENTO	MEDIA





IDENTIFICACION DEL REQUERIMIENTO	RF-04
NOMBRE DEL REQUERIMIENTO	Generación de Reporte CPIC
CARACTERISTICAS	Exportación de documento.
DESCRIPCION DEL REQUERIMIENTO	El sistema generará el archivo oficial (Excel) poblado con las asistencias registradas, respetando el diseño gráfico del centro.
REQUERIMIENTO NO FUNCIONAL	
PRIORIDAD DEL REQUERIMIENTO	ALTA

IDENTIFICACION DEL REQUERIMIENTO	RF-05
NOMBRE DEL REQUERIMIENTO	Monitoreo Global de Fichas
CARACTERISTICAS	Búsqueda y lectura por parte de coordinación
DESCRIPCION DEL REQUERIMIENTO	El Coordinador podrá buscar por número de ficha y visualizar la matriz de asistencia completa del grupo, sin permisos para modificarla.
REQUERIMIENTO NO FUNCIONAL	
PRIORIDAD DEL REQUERIMIENTO	MEDIA



3.3.	REQUISITOS NO FUNCIONALES 

IDENTIFICACION DEL REQUERIMIENTO	RNF-01
NOMBRE DEL REQUERIMIENTO	Privacidad y Aislamiento de Datos
CARACTERISTICAS	Control de vistas	
DESCRIPCION DEL REQUERIMIENTO	Un usuario con rol "Aprendiz" bajo ninguna circunstancia podrá acceder a los registros de asistencia de otro compañero.
PRIORIDAD DEL REQUERIMIENTO	ALTA




IDENTIFICACION DEL REQUERIMIENTO	RNF-02
NOMBRE DEL REQUERIMIENTO	Usabilidad e Interfaz (UX/UI)
CARACTERISTICAS	Agilidad operativa
DESCRIPCION DEL REQUERIMIENTO	El diseño debe permitir que la toma de asistencia diaria no tome más de 3 interacciones (clics) por parte del instructor para llegar a la lista.
PRIORIDAD DEL REQUERIMIENTO	MEDIA


IDENTIFICACION DEL REQUERIMIENTO	RNF-03
NOMBRE DEL REQUERIMIENTO	Cumplimiento Visual del Formato
CARACTERISTICAS	Exactitud en la exportación
DESCRIPCION DEL REQUERIMIENTO	El archivo Excel generado debe respetar el encabezado "CONTROL DE INASISTENCIAS Y REPORTE DE DESERCIÓN", mantener los logos del SENA y la distribución de columnas exactamente igual a la plantilla física entregada por el cliente.
PRIORIDAD DEL REQUERIMIENTO	ALTA



4.	REQUISITOS ESPECIFICOS

4.1.	CONSTRUCCIÓN DE PROTOTIPOS

Se realizarán bocetos y wireframes (en herramientas como Figma) de las pantallas principales del sistema para validarlas con los instructores y el coordinador antes de iniciar la programación. Los prototipos a presentar serán:

1.	Vista Instructor: Lista de chequeo para tomar asistencia.
2.	Vista Aprendiz: Tarjeta de perfil con el número de fallas en grande.
3.	Vista Reporte: Botón de descarga del formato.




4.2.	FORMATO DE CASO DE PRUEBA


FORMATO DE CASOS DE PRUEBA
OBJETIVO DEL CASO DE PRUEBA	Verificar que el aprendiz puede ver sus propias fallas correctamente.
IDENTIFICADOR	CP-01 (Consulta Aprendiz)
NOMBRE DEL REQUERIMIENTO	Consulta de Historial (RF-03)
PRECONDICIONES	1. El Instructor marcó falla al aprendiz "Pepito" el día de ayer.
PASOS	RESULTADOS ESPERADOS
1. Ingresar al sistema con el usuario de "Pepito".	1. El sistema muestra el menú de Aprendiz.
2. Ir a "Mi Asistencia".	2. Se muestra el historial.
3. Verificar el registro de ayer.	3. Debe aparecer marcado como "Falla" o "Inasistencia". 

 
FORMATO DE CASOS DE PRUEBA
OBJETIVO DEL CASO DE PRUEBA	Validar que el archivo descargado inyecta correctamente las fallas en la plantilla oficial.
IDENTIFICADOR	CP-02
NOMBRE DEL REQUERIMIENTO	Exportación a Formato Oficial CPIC (RF-05)
PRECONDICIONES	1. El Aprendiz "Andrés Felipe" está matriculado en la Ficha 2929061-B.

2. El instructor registró una "Falla" para este aprendiz el día 15 de Febrero en la base de datos.
PASOS	RESULTADOS ESPERADOS
1. Ingresar al sistema con el usuario de "Pepito".	Se visualiza el panel del instructor.
2. Ir a "Mi Asistencia".	El sistema muestra la lista de fichas disponibles.
3. Verificar el registro de ayer.	El navegador descarga el archivo con formato .xlsx exitosamente.
5.	Abrir el documento Excel descargado y verificar los datos.	El documento tiene el logo del SENA. En la fila del nombre "Andrés Felipe", debe aparecer una "X" en la casilla correspondiente al día 15 del mes, dejando las demás en blanco.


DIAGRAMA DE CLASES:




 












MODELO ENTIDAD RELACION:

 

























DIAGRAMA CASOS DE USO:



 
