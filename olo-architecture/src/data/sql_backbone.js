// ═══════════════════════════════════════════════════════════════════════════
// DATOS · BACKBONE SQL — catálogo real de triggers, stored procedures y
// funciones extraído en vivo (2026-08-28) de las instancias EPRAC/eflow y
// Softland a las que el usuario de integración OLO tiene acceso de lectura de
// metadata (sys.procedures/sys.objects/sys.triggers/sys.sql_modules). No
// incluye SQL Server Agent (msdb.dbo.sysjobs): permiso denegado en las 6
// instancias conectadas. Los objetos de Softland vienen cifrados por el
// proveedor (WITH ENCRYPTION) — sin definición disponible, se marca `encrypted`.
// Instantánea estática — regenerar con build_backbone2_tmp.js si cambian los
// permisos o el esquema.
// ═══════════════════════════════════════════════════════════════════════════

export const BACKBONE_GENERATED_AT = "2026-08-28";

export const BACKBONE_JOBS_AVAILABLE = false;
export const BACKBONE_JOBS_NOTE = "SQL Server Agent (msdb.dbo.sysjobs) devuelve permiso denegado en las 6 instancias conectadas — requiere que un DBA otorgue acceso a msdb para incorporar este dato.";

export const BACKBONE_SUMMARY = {
  "procs": 15,
  "fns": 37,
  "triggers": 4742,
  "instancesWithAccess": 4,
  "instancesNoAccess": 4
};

export const BACKBONE_CATEGORIES = [
  {
    "id": "integracion",
    "label": "Integración inter-sistemas",
    "count": 15
  },
  {
    "id": "fiscal",
    "label": "Compliance fiscal / Facturación electrónica",
    "count": 21
  },
  {
    "id": "auditoria",
    "label": "Auditoría",
    "count": 0
  },
  {
    "id": "mantenimiento",
    "label": "Mantenimiento",
    "count": 0
  },
  {
    "id": "otros",
    "label": "Otros / sin clasificar",
    "count": 16
  }
];

export const BACKBONE_SOURCES = [
  {
    "id": "wmh_cr",
    "label": "WMH · Torre de Control (CR)",
    "empresa": "Costa Rica",
    "procs": [
      {
        "name": "load_data_ext_tms_almacenmovimientos_carcam",
        "category": "integracion",
        "modified": "2025-09-09",
        "definition": "create PROCEDURE staging.load_data_ext_tms_almacenmovimientos_carcam\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_almacenmovimientos_carcam';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_almacenmovimientos_carcam_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_almacenmovimientos_carcam_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_almacenmovimientos_carcam_mt(\r\n\t\tIDMOVIMIENTO,\r\n\t\talmacen,\r\n\t\tsucursal,\r\n\t\tnum_pedido,\r\n\t\tlinea,\r\n\t\tnum_guia,\r\n\t\tnum_viaje,\r\n\t\tdriver_code,\r\n\t\tunit_code,\r\n\t\tcod_articulo,\r\n\t\tcompania,\r\n\t\tcantidad,\r\n\t\tpeso,\r\n\t\tfech_carga_camion,\r\n\t\tfechacierre,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tA.IDMOVIMIENTO,\r\n\t\tA.IDALMACEN,\r\n\t\tA.IDSUCURSAL,\r\n\t\tA.IDEXPEDICION , \r\n\t\tA.IDEXPEDICIONLINEA,\r\n\t\tA.IDCONFIRMACION,\r\n\t\tA.NUMEROVIAJE,\r\n\t\tA.PLACA, \r\n\t\tA.IDUNIDADTRANSPORTE,\r\n\t\tA.IDARTICULO,\r\n\t\tA.IDCOMPANIA,\r\n\t\tA.CANTIDAD,\r\n\t\tA.PESO,\r\n\t\tA.FECHAGENERACION,\r\n\t\tA.FECHACIERRE,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\tEFLOW_OLO.DBO.ALMACENMOVIMIENTOS_CARCAM A\r\n\t\twhere NUMEROVIAJE <> 'PEND' \r\n\t\tand (FECHACIERRE > @FEC_EJEC OR FECHAGENERACION > @FEC_EJEC)\r\n\t\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = (select case when max(FECHACIERRE) is null then @FEC_EJEC else max(FECHACIERRE) end from EFLOW_WMH.staging.ext_tms_almacenmovimientos_carcam_mt)\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_articulosgestion",
        "category": "integracion",
        "modified": "2025-08-25",
        "definition": "create procedure staging.load_data_ext_tms_articulosgestion\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_articulosgestion';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_articulosgestion_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_articulosgestion_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_articulosgestion_mt(\r\n\t\tcod_articulo,\r\n\t\tcompania,\r\n\t\tarticulo,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tIDARTICULO,\r\n\t\tIDCOMPANIA,\r\n\t\tDESCRIPCIONLARGA,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\t(\r\n\t\t\t\tSELECT IDCOMPANIA, IDARTICULO, DESCRIPCIONLARGA\r\n\t\t\t\t\tfrom EFLOW_OLO.dbo.ARTICULOSGESTION\r\n\t\t\t) as A\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_clientes",
        "category": "integracion",
        "modified": "2025-09-08",
        "definition": "create procedure staging.load_data_ext_tms_clientes\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_clientes';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_clientes_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_clientes_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_clientes_mt(\r\n\t\tcodigo_cliente ,\r\n\t\tcompania ,\r\n\t\tnom_cliente ,\r\n\t\tdir_fiscal ,\r\n\t\temail,\r\n\t\ttelefono,\r\n\t\tcelular,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tIDCLIENTE,\r\n\t\tIDCOMPANIA,\r\n\t\tNOMBRELARGO,\r\n\t\tDIRECCIONLARGA,\r\n\t\temail,\r\n\t\ttelefono,\r\n\t\tcelular,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\tEFLOW_OLO.dbo.CLIENTES\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\n\tend try\r\n\tBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_compania",
        "category": "integracion",
        "modified": "2025-08-25",
        "definition": "create procedure staging.load_data_ext_tms_compania\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_compania';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_compania_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_compania_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_compania_mt(\r\n\t\tcompania,\r\n\t\tnombre_compania,\r\n\t\tdireccion,\r\n\t\temail,\r\n\t\tpais,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\ta.idcompania, \r\n\t\ta.DESCRIPCION, \r\n\t\ta.DIRECCION, \r\n\t\ta.EMAIL, \r\n\t\ta.pais,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\tfrom EFLOW_OLO.DBO.compania a\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_drivers",
        "category": "integracion",
        "modified": "2025-10-23",
        "definition": "create procedure staging.load_data_ext_tms_drivers\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_drivers';\r\n    \r\n  \t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n\t\t\t\t\t\t\r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_drivers_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_drivers_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_drivers_mt(\r\n\t\tchoferid,\r\n\t\tdriver_code,\r\n\t\ttransportation_company_id,\r\n\t\tdriver_card_id,\r\n\t\tchofer,\r\n\t\ttelefono_chofer, \r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tdriver_id,\r\n\t\tdriver_code,\r\n\t\ttransportation_company_id,\r\n\t\tdriver_card_id,\r\n\t\tdriver_name,\r\n\t\tdriver_phone, \r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\t(\r\n\t\t\t\tselect driver_id, driver_code, transportation_company_id, \r\n\t\t\t\t\t\tdriver_name, driver_card_id, driver_phone\r\n\t\t\t\t\tfrom EFLOW_WMH.dbo.drivers\r\n\t\t\t) as drivers\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_eflow",
        "category": "integracion",
        "modified": "2025-09-02",
        "definition": "create PROCEDURE staging.load_data_ext_tms_eflow\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_eflow';\r\n\r\n\t/*-----ARTICULOSGESTION-----*/\r\n\tEXEC staging.load_data_ext_tms_articulosgestion;\r\n\t\r\n\t/*-----ALMACENMOVIMIENTOS_CARCAM-----*/\r\n\tEXEC staging.load_data_ext_tms_almacenmovimientos_carcam;\r\n\t\r\n\t/*-----CLIENTES-----*/\r\n\tEXEC staging.load_data_ext_tms_clientes;\r\n\t\r\n\t/*-----DRIVERS-----*/\r\n\tEXEC staging.load_data_ext_tms_drivers;\r\n\t\r\n\t/*-----EXPEDICIONESCABECERA-----*/\r\n\tEXEC staging.load_data_ext_tms_expedicionescabecera;\r\n\r\n\t/*-----EXPEDICIONESDETALLE-----*/\r\n\tEXEC staging.load_data_ext_tms_expedicionesdetalle;\r\n\t\r\n\t/*-----TRANSPORTATION_COMPANIES-----*/\r\n\tEXEC staging.load_data_ext_tms_transportation_companies;\r\n\t\r\n\t/*-----TRASPORTATION_UNITS-----*/\r\n\tEXEC staging.load_data_ext_tms_trasportation_units;\r\n\r\n\t/*-----COMPANIA-----*/\r\n\tEXEC staging.load_data_ext_tms_compania;\r\n\r\n\t/*-----SUCURSAL-----*/\r\n\tEXEC staging.load_data_ext_tms_sucursal;\r\n\r\n\t/*-----WMS_PEDIDO_FACTURA-----*/\r\n\tEXEC staging.load_data_ext_tms_wms_pedido_factura;\r\n\t\r\n\t/*-----JOURNEY_ORDER_TRANSPORTATION-----*/\r\n\tEXEC staging.load_data_ext_tms_journey_order_transportation;\r\n\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_expedicionescabecera",
        "category": "integracion",
        "modified": "2025-11-07",
        "definition": "create procedure staging.load_data_ext_tms_expedicionescabecera\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_expedicionescabecera';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_expedicionescabecera_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_expedicionescabecera_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_expedicionescabecera_mt(\r\n\t\tnum_pedido,\r\n\t\talmacen, \r\n\t\tsucursal,\r\n\t\tcompania,\r\n\t\tcodigo_cliente,\r\n\t\tsector,\r\n\t\tnum_viaje_wmh,\r\n\t\truta,\r\n\t\tcanton, \r\n\t\tdistrito,\r\n\t\tnum_factura,\r\n\t\tmonto_facturado,\r\n\t\tfech_cierre,\r\n\t\tfech_facturado,\r\n\t\tfech_generacion,\r\n\t\tfech_modificacion,\r\n\t\tfech_aprobacion,\r\n\t\tfech_planificada,\r\n\t\tfechaexpedicion,\r\n\t\tfecha_cierre_carcam,\r\n\t\tfecha_generacion_carcam,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tEXPEDICIONESCABECERA.IDEXPEDICION ,\r\n\t\tEXPEDICIONESCABECERA.IDALMACEN, \r\n\t\tEXPEDICIONESCABECERA.IDSUCURSAL,\r\n\t\tEXPEDICIONESCABECERA.IDCOMPANIA,\r\n\t\tEXPEDICIONESCABECERA.IDCLIENTE,\r\n\t\tEXPEDICIONESCABECERA.REF2,\r\n\t\tcase when EXPEDICIONESCABECERA.NUMEROVIAJEWMH is null \r\n\t\t\tthen -1\r\n\t\t\telse EXPEDICIONESCABECERA.NUMEROVIAJEWMH \r\n\t\tend as NUMEROVIAJEWMH,\r\n\t\tcase when EXPEDICIONESCABECERA.RUTA is null \r\n\t\t\tthen 'No_aplica' \r\n\t\t\telse EXPEDICIONESCABECERA.RUTA \r\n\t\tend as RUTA,\r\n\t\tEXPEDICIONESCABECERA.CLASIFICACION2,\r\n\t\tEXPEDICIONESCABECERA.REF2,\r\n\t\tEXPEDICIONESCABECERA.FACTURA,\r\n\t\tEXPEDICIONESCABECERA.COSTO_TOTAL,\r\n\t\tEXPEDICIONESCABECERA.FECHACIERRE,\r\n\t\tcase when EXPEDICIONESCABECERA.FACTURA is null \r\n\t\t\tthen null\r\n\t\t\telse EXPEDICIONESCABECERA.FECHACIERRE\r\n\t\tend fech_facturado,\r\n\t\tEXPEDICIONESCABECERA.FECHAGENERACION,\r\n\t\tEXPEDICIONESCABECERA.FECHAMODIFICACION,\r\n\t\tEXPEDICIONESCABECERA.FECHACREACION,\r\n\t\tEXPEDICIONESCABECERA.FECHAEXPEDICIONPLANIFICADA,\r\n\t\tEXPEDICIONESCABECERA.FECHAEXPEDICION,\r\n\t\tALMACENMOVIMIENTOS_CARCAM.FECHACIERRE,\r\n\t\tALMACENMOVIMIENTOS_CARCAM.FECHAGENERACION,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\t(\r\n\t\t\t\tSELECT IDCOMPANIA, IDALMACEN, IDSUCURSAL, IDEXPEDICION, \r\n\t\t\t\t\t\tIDCLIENTE, REF2, NUMEROVIAJEWMH, RUTA, FACTURA, \r\n\t\t\t\t\t\tCOSTO_TOTAL, FECHACREACION, FECHACIERRE, FECHAEXPEDICION,\r\n\t\t\t\t\t\tFECHAEXPEDICIONPLANIFICADA, FECHAGENERACION, FECHAMODIFICACION,\r\n\t\t\t\t\t\tCLASIFICACION2\r\n\t\t\t\t\tFROM EFLOW_OLO.DBO.EXPEDICIONESCABECERA\r\n\t\t\t) as EXPEDICIONESCABECERA\r\n\t\t\tinner join \r\n\t\t\t(\r\n\t\t\t\tSELECT IDCOMPANIA, IDALMACEN, IDSUCURSAL, IDEXPEDICION, \r\n\t\t\t\t\t\tMAX(FECHACIERRE) FECHACIERRE , \r\n\t\t\t\t\t\tMAX(FECHAGENERACION) FECHAGENERACION \r\n\t\t\t\t\tFROM EFLOW_OLO.DBO.ALMACENMOVIMIENTOS_CARCAM\r\n\t\t\t\t\tgroup by IDEXPEDICION, IDCOMPANIA, IDALMACEN, IDSUCURSAL\r\n\t\t\t) as ALMACENMOVIMIENTOS_CARCAM\r\n\t\ton \r\n\t\t\tEXPEDICIONESCABECERA.IDCOMPANIA = ALMACENMOVIMIENTOS_CARCAM.IDCOMPANIA\r\n\t\t\tand EXPEDICIONESCABECERA.IDEXPEDICION = ALMACENMOVIMIENTOS_CARCAM.IDEXPEDICION\r\n\t\t\tand EXPEDICIONESCABECERA.IDALMACEN = ALMACENMOVIMIENTOS_CARCAM.IDALMACEN\r\n\t\t\tand EXPEDICIONESCABECERA.IDSUCURSAL = ALMACENMOVIMIENTOS_CARCAM.IDSUCURSAL\r\n\t\twhere \t(ALMACENMOVIMIENTOS_CARCAM.FECHACIERRE > @FEC_EJEC\r\n\t\t\t\tor ALMACENMOVIMIENTOS_CARCAM.FECHAGENERACION > @FEC_EJEC);\r\n\r\n\t\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente =  (\r\n\t\t\t\tselect \t\r\n\t\t\t\t\tcase \r\n\t\t\t\t\t\twhen (\r\n\t\t\t\t\t\t\t\tmax(fecha_cierre_carcam) is null \r\n\t\t\t\t\t\t\t\tand max(fecha_generacion_carcam) is null\r\n\t\t\t\t\t\t\t)\r\n\t\t\t\t\t\t\tthen @FEC_EJEC\r\n\t\t\t\t\t\t\telse (SELECT MAX([Greatest])  FROM\r\n\t\t\t\t\t\t          \t(VALUES (max(fecha_cierre_carcam)), \r\n\t\t\t\t\t\t          \t\t\t(max(fecha_generacion_carcam))\r\n\t\t\t\t\t\t          \t)\r\n\t\t\t\t\t\t            AS derived_table([Greatest])\r\n\t\t\t\t\t\t         )\r\n\t\t\t\t\tend \r\n\t\t\t\tfrom \r\n\t\t\t\t\tEFLOW_WMH.staging.ext_tms_expedicionescabecera_mt)\r\n\t\twhere nombre_sp = @NOM_SP;\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_expedicionesdetalle",
        "category": "integracion",
        "modified": "2025-09-30",
        "definition": "create procedure staging.load_data_ext_tms_expedicionesdetalle\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_expedicionesdetalle';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_expedicionesdetalle_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_expedicionesdetalle_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_expedicionesdetalle_mt(\r\n\t\tnum_pedido,\r\n\t\talmacen, \r\n\t\tsucursal,\r\n\t\tlinea,\r\n\t\tcod_articulo,\r\n\t\tcompania,\r\n\t\tcantidad_ped,\r\n\t\tpeso_preparado,\r\n\t\tcantidad_proc,\r\n\t\tcostounitario,\r\n\t\tfechacierre,\r\n\t\tfechageneracion,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tEXPEDICIONESDETALLE.IDEXPEDICION , \r\n\t\tEXPEDICIONESDETALLE.IDALMACEN, \r\n\t\tEXPEDICIONESDETALLE.IDSUCURSAL,\r\n\t\tEXPEDICIONESDETALLE.IDEXPEDICIONLINEA,\r\n\t\tEXPEDICIONESDETALLE.IDARTICULO,\r\n\t\tEXPEDICIONESDETALLE.IDCOMPANIA,\r\n\t\tEXPEDICIONESDETALLE.UNIDADESPEDIDAS,\r\n\t\tEXPEDICIONESDETALLE.PESOPREPARADO,\r\n\t\tEXPEDICIONESDETALLE.UNIDADESPREPARADAS,\r\n\t\tEXPEDICIONESDETALLE.COSTOUNITARIO,\r\n\t\tALMACENMOVIMIENTOS_CARCAM.FECHACIERRE,\r\n\t\tALMACENMOVIMIENTOS_CARCAM.FECHAGENERACION,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\t(\r\n\t\t\t\tselect IDCOMPANIA, IDALMACEN, IDSUCURSAL, IDEXPEDICION, \r\n\t\t\t\t\t\tIDARTICULO, UNIDADESPREPARADAS, UNIDADESPEDIDAS, \r\n\t\t\t\t\t\tPESOPREPARADO, IDEXPEDICIONLINEA, COSTOUNITARIO\r\n\t\t\t\t\tfrom EFLOW_OLO.DBO.EXPEDICIONESDETALLE \r\n\t\t\t) as EXPEDICIONESDETALLE\r\n\t\tinner join \r\n\t\t\t(\r\n\t\t\t\tSELECT IDCOMPANIA, IDALMACEN, IDSUCURSAL, IDEXPEDICION, \r\n\t\t\t\t\t\tIDARTICULO, MAX(FECHACIERRE) FECHACIERRE , \r\n\t\t\t\t\t\tMAX(FECHAGENERACION) FECHAGENERACION \r\n\t\t\t\t\tFROM EFLOW_OLO.DBO.ALMACENMOVIMIENTOS_CARCAM\r\n\t\t\t\t\tgroup by IDEXPEDICION, IDARTICULO, IDCOMPANIA, IDALMACEN, IDSUCURSAL\r\n\t\t\t) as ALMACENMOVIMIENTOS_CARCAM\r\n\t\ton \r\n\t\t\tEXPEDICIONESDETALLE.IDCOMPANIA = ALMACENMOVIMIENTOS_CARCAM.IDCOMPANIA\r\n\t\t\tand EXPEDICIONESDETALLE.IDEXPEDICION = ALMACENMOVIMIENTOS_CARCAM.IDEXPEDICION\r\n\t\t\tand EXPEDICIONESDETALLE.IDARTICULO = ALMACENMOVIMIENTOS_CARCAM.IDARTICULO\r\n\t\t\tand EXPEDICIONESDETALLE.IDALMACEN = ALMACENMOVIMIENTOS_CARCAM.IDALMACEN\r\n\t\t\tand EXPEDICIONESDETALLE.IDSUCURSAL = ALMACENMOVIMIENTOS_CARCAM.IDSUCURSAL\r\n\t\twhere \t(FECHACIERRE > @FEC_EJEC\r\n\t\t\t\tor FECHAGENERACION > @FEC_EJEC)\r\n\t\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = \r\n\t\t\t(\r\n\t\t\t\tselect \t\r\n\t\t\t\t\tcase \r\n\t\t\t\t\t\twhen (max(FECHACIERRE) is null \r\n\t\t\t\t\t\t\tand max(FECHAGENERACION) is null )\r\n\t\t\t\t\t\t\tthen @FEC_EJEC\r\n\t\t\t\t\t\t\telse (SELECT MAX([Greatest])  FROM\r\n\t\t\t\t\t\t          \t(VALUES (max(FECHACIERRE)), \r\n\t\t\t\t\t\t          \t\t\t(max(FECHAGENERACION)))\r\n\t\t\t\t\t\t            \tAS derived_table([Greatest]))\r\n\t\t\t\t\tend \r\n\t\t\t\tfrom \r\n\t\t\t\t\tEFLOW_WMH.staging.ext_tms_expedicionesdetalle_mt\r\n\t\t\t)\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_journey_order_transportation",
        "category": "integracion",
        "modified": "2025-09-03",
        "definition": "create procedure staging.load_data_ext_tms_journey_order_transportation\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_journey_order_transportation';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_journey_order_transportation_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_journey_order_transportation_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_journey_order_transportation_mt(\r\n\t\tnum_viaje_wmh,\r\n\t\tnum_pedido,\r\n\t\talmacen,\r\n\t\tsucursal,\r\n\t\tcompania,\r\n\t\tunit_id,\r\n\t\tchoferId,\r\n\t\tsituation,\r\n\t\tassigment_date ,\r\n\t\tbatch_code ,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\ta.journey_id,\r\n\t\ta.order_number,\r\n\t\ta.warehouse_code,\r\n\t\ta.branch_id,\r\n\t\ta.company_id,\r\n\t\ta.unit_id,\r\n\t\ta.driver_id,\r\n\t\ta.situation,\r\n\t\ta.assigment_date,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\tEFLOW_WMH.dbo.journey_order_transportation a\r\n\t\tinner join \r\n\t\t\t(\r\n\t\t\t\tselect max(assigment_id) as assigment_id\r\n\t\t\t\tfrom EFLOW_WMH.dbo.journey_order_transportation\r\n\t\t\t\tWHERE assigment_date > @FEC_EJEC\r\n\t\t\t\tgroup by journey_id, order_number, warehouse_code, branch_id, company_id, driver_id, unit_id\r\n\t\t\t) v\r\n\t\ton a.assigment_id = v.assigment_id\r\n\t\t;\r\n\t\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = (select case when max(assigment_date) is null then @FEC_EJEC else max(assigment_date) end from EFLOW_WMH.staging.ext_tms_journey_order_transportation_mt)\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_sucursal",
        "category": "integracion",
        "modified": "2025-08-25",
        "definition": "create procedure staging.load_data_ext_tms_sucursal\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_sucursal';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_sucursal_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_sucursal_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_sucursal_mt(\r\n\t\tsucursal,\r\n\t\tcompania,\r\n\t\tnombre_sucursal,\r\n\t\ttipo_sucursal,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\ts.idsucursal, \r\n\t\ts.IDCOMPANIA,\r\n\t\ts.NOMBRELARGOSUCURSAL, \r\n\t\ts.TIPOSUCURSAL, \r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\tfrom EFLOW_OLO.DBO.sucursal s\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_transportation_companies",
        "category": "integracion",
        "modified": "2025-08-25",
        "definition": "create procedure staging.load_data_ext_tms_transportation_companies\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_transportation_companies';\r\n    \r\n  \t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_transportation_companies_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_transportation_companies_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_transportation_companies_mt(\r\n\t\ttransportation_company_id,\r\n\t\tcomp_transporte,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\ttransportation_company_id,\r\n\t\tcompany_name,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\t(\r\n\t\t\t\tselect transportation_company_id, company_name\r\n\t\t\t\t\tfrom EFLOW_WMH.dbo.transportation_companies\r\n\t\t\t) as trasportation_units\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_trasportation_units",
        "category": "integracion",
        "modified": "2025-09-30",
        "definition": "create procedure staging.load_data_ext_tms_trasportation_units\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_trasportation_units';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n     \r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_trasportation_units_mt x where job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_trasportation_units_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_trasportation_units_mt(\r\n\t\tunit_id,\r\n\t\tplaca,\r\n\t\tunit_code,\r\n\t\ttransportation_company_id,\r\n\t\tunidad_transporte,\r\n\t\tmarca_vehiculo,\r\n\t\ttipo_vehiculo,\r\n\t\tpeso,\r\n\t\tvolumen,\r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tunit_id,\r\n\t\tlicense_plate,\r\n\t\tunit_code,\r\n\t\ttransportation_company_id,\r\n\t\tunit_description,\r\n\t\tvehicle_brand,\r\n\t\tvehicle_type_id,\r\n\t\tweight_capacity,\r\n\t\tvolumetric_capacity,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\t\tFROM \r\n\t\t\tEFLOW_WMH.dbo.trasportation_units\r\n\t;\r\n\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = GETDATE()\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "load_data_ext_tms_wms_pedido_factura",
        "category": "integracion",
        "modified": "2025-09-01",
        "definition": "create procedure staging.load_data_ext_tms_wms_pedido_factura\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n  \tDeclare @N INT;\r\n \tDECLARE @BATCHCODE VARCHAR(32);   \r\n\tSELECT @BATCHCODE = CONVERT(VARCHAR(32), HashBytes('SHA2_256', LEFT(CONVERT(VARCHAR, CURRENT_TIMESTAMP, 20), 20)), 2);\r\n\tDECLARE @FEC_EJEC datetime; \r\n    DECLARE @NOM_SP VARCHAR(255);  \r\n   \r\n   \t--Variable generales\r\n  \tselect @NOM_SP = 'load_data_ext_tms_wms_pedido_factura';\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\tselect @FEC_EJEC = fecha_ejecucion from EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt t \r\n\t\t\t\t\t\t\twhere t.nombre_sp = @NOM_SP;\r\n\r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tSelect @N = count(*) FROM EFLOW_WMH.staging.ext_tms_wms_pedido_factura_mt x \r\n\t\t\t\t\twhere job_execution_status = 'ACTIVE';\r\n    IF @N != 0 \r\n    \tUPDATE EFLOW_WMH.staging.ext_tms_wms_pedido_factura_mt SET job_execution_date = GETDATE(),\r\n\t\t\tjob_execution_status = 'Sync Pending' WHERE job_execution_status = 'ACTIVE';\r\n\t\r\n\tinsert into EFLOW_WMH.staging.ext_tms_wms_pedido_factura_mt(\r\n\t\tnum_pedido,\r\n\t\talmacen,\r\n\t\tsucursal,\r\n\t\tcompania,\t\r\n\t\tnum_factura,\r\n\t\tcod_articulo,\r\n\t\tfech_facturado, \r\n\t\tbatch_code,\r\n\t\tupdate_by_etl,\r\n\t\tjob_execution_date,\r\n\t\tjob_execution_status\r\n\t)\r\n\tselect \r\n\t\tIDEXPEDICION,\r\n\t\tIDALMACEN,\r\n\t\tIDSUCURSAL,\r\n\t\tIDCOMPANIA,\r\n\t\tFACTURA,\r\n\t\tIDARTICULO,\r\n\t\tFECHA_FACTURA,\r\n\t\t@BATCHCODE,\r\n\t\tGETDATE(),\r\n\t\tGETDATE(),\r\n\t\t'ACTIVE'\r\n\tFROM \r\n\t\tEFLOW_OLO.DBO.WMS_PEDIDO_FACTURA\r\n\twhere FECHA_FACTURA > @FEC_EJEC\r\n\t;\r\n\r\n\t--Carga de la maxima fecha de pedido que se a cargado\r\n\t\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_siguiente = (select case when max(fech_facturado) is null \r\n\t\t\t\t\t\t\t\t\t\tthen @FEC_EJEC \r\n\t\t\t\t\t\t\t\t\t\telse max(fech_facturado) \r\n\t\t\t\t\t\t\t\t\t\tend \r\n\t\t\t\t\t\t\t\t\tfrom EFLOW_WMH.staging.ext_tms_wms_pedido_factura_mt\r\n\t\t\t\t\t\t\t\t)\r\n\t\twhere nombre_sp = @NOM_SP;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\nEND CATCH;\r\n",
        "encrypted": false
      },
      {
        "name": "sp_tms_origin_clean_all_mt",
        "category": "integracion",
        "modified": "2025-09-02",
        "definition": "CREATE PROCEDURE staging.sp_tms_origin_clean_all_mt\r\nAS\r\n BEGIN TRY\r\n    -- body procedure\r\n  \tDeclare @N INT;\r\n     \r\n    -- Validar si hay registros en la ext_tms_almacenmovimientos_carcam_mt para realizar el update\r\n\tSelect @N = count(*) FROM staging.ext_tms_almacenmovimientos_carcam_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_almacenmovimientos_carcam_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n    \r\n    -- Validar si hay registros en la ext_tms_articulosgestion_mt para realizar el update\r\n\tSelect @N = count(*) FROM staging.ext_tms_articulosgestion_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_articulosgestion_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n \r\n    -- Validar si hay registros en la ext_tms_clientes_mt para realizar el update\r\n\tSelect @N = count(*) FROM staging.ext_tms_clientes_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_clientes_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n        \r\n    -- Validar si hay registros en la ext_tms_drivers_mt para realizar el update\r\n\tSelect @N = count(*) FROM staging.ext_tms_drivers_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_drivers_mt  WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n        \r\n    -- Validar si hay registros en la ext_tms_expedicionescabecera_mt para realizar el update\r\n\tSelect @N = count(*) FROM staging.ext_tms_expedicionescabecera_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_expedicionescabecera_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n\r\n    -- Validar si hay registros en la ext_tms_expedicionesdetalle_mt para realizar el update\r\n\tSelect @N = count(*) FROM staging.ext_tms_expedicionesdetalle_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_expedicionesdetalle_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n\r\n   -- Validar si hay registros en la ext_tms_transportation_companies_mt para realizar el update        \r\n   Select @N = count(*) FROM staging.ext_tms_transportation_companies_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_transportation_companies_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n    \r\n   -- Validar si hay registros en la ext_tms_trasportation_units_mt para realizar el update        \r\n   Select @N = count(*) FROM staging.ext_tms_trasportation_units_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_trasportation_units_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n    \r\n\t-- Validar si hay registros en la ext_tms_compania_mt para realizar el update        \r\n   Select @N = count(*) FROM staging.ext_tms_compania_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_compania_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n    \r\n\t-- Validar si hay registros en la ext_tms_sucursal_mt para realizar el update        \r\n   Select @N = count(*) FROM staging.ext_tms_sucursal_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_sucursal_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n\r\n\t-- Validar si hay registros en la ext_tms_wms_pedido_factura_mt para realizar el update        \r\n   Select @N = count(*) FROM staging.ext_tms_wms_pedido_factura_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_wms_pedido_factura_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n\r\n\t-- Validar si hay registros en la ext_tms_journey_order_transportation_mt para realizar el update        \r\n   Select @N = count(*) FROM staging.ext_tms_journey_order_transportation_mt  x where job_execution_status = 'ACTIVE'  and update_by_etl is not null;\r\n    IF @N != 0   \r\n  \t--Borrado de datos \r\n\t\t\tDELETE FROM staging.ext_tms_journey_order_transportation_mt WHERE job_execution_status  = 'ACTIVE' and update_by_etl is not null;\r\n\r\n   END TRY\r\n \tBEGIN CATCH  --manejo de errores\r\n    INSERT INTO staging.tms_errors\r\n    VALUES(SUSER_SNAME(),\r\n\t\t   ERROR_NUMBER(),\r\n\t\t   ERROR_STATE(),\r\n\t\t   ERROR_SEVERITY(),\r\n\t\t   ERROR_LINE(),\r\n\t\t   ERROR_PROCEDURE(),\r\n\t\t   ERROR_MESSAGE(),\r\n\t\t   GETDATE());\r\nEND CATCH;",
        "encrypted": false
      },
      {
        "name": "sp_tms_origin_update_fecha_ejecucion",
        "category": "integracion",
        "modified": "2025-09-02",
        "definition": "create procedure staging.sp_tms_origin_update_fecha_ejecucion\r\nAS \r\nbegin try\r\n\t-- body procedure\r\n   \r\n   \t--Variable generales\r\n  \r\n\t--Carga de la ultima ejecucion del sp\r\n\r\n    -- Validar si hay registros en la ext_timesheet_mt y vaciarla\r\n\tupdate EFLOW_WMH.staging.stat_ts_sp_ejecucion_mt\r\n\t\tset fecha_ejecucion = fecha_siguiente;\r\n\t\r\nend try\r\nBEGIN CATCH  --manejo de errores\r\n    INSERT INTO EFLOW_WMH.staging.tms_errors\r\n    VALUES\r\n  (SUSER_SNAME(),\r\n   ERROR_NUMBER(),\r\n   ERROR_STATE(),\r\n   ERROR_SEVERITY(),\r\n   ERROR_LINE(),\r\n   ERROR_PROCEDURE(),\r\n   ERROR_MESSAGE(),\r\n   GETDATE());\r\n END CATCH;",
        "encrypted": false
      }
    ],
    "fns": [],
    "triggersTop": [],
    "triggersTotal": 0,
    "triggersTablesCount": 0
  },
  {
    "id": "wmh_ve",
    "label": "WMH · Torre de Control (VE)",
    "empresa": "Venezuela",
    "procs": [],
    "fns": [],
    "triggersTop": [],
    "triggersTotal": 0,
    "triggersTablesCount": 0
  },
  {
    "id": "eintegra_epa",
    "label": "eIntegra · EPA (CR)",
    "empresa": "Costa Rica",
    "procs": [],
    "fns": [],
    "triggersTop": [],
    "triggersTotal": 0,
    "triggersTablesCount": 0
  },
  {
    "id": "softland_ve",
    "label": "Softland · QA (VE)",
    "empresa": "Venezuela",
    "procs": [],
    "fns": [
      {
        "name": "AB_FUN_FECHA_VENCIMINETO_FACTURA",
        "type": "IF",
        "category": "fiscal",
        "modified": "2026-01-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "AB_FUN_PORCETANJE_MONTO_APLICADO_RECIBO",
        "type": "IF",
        "category": "otros",
        "modified": "2026-01-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "AB_FUN_PORCETANJE_MONTO_APLICADO_RECIBO_LOCAL",
        "type": "IF",
        "category": "otros",
        "modified": "2026-01-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "FN_AFV_CLIENTE_PAGO_FRECUENTE",
        "type": "IF",
        "category": "otros",
        "modified": "2026-06-17",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "GN_FN_CALCULAR_FECHAS_PEDIDO",
        "type": "TF",
        "category": "otros",
        "modified": "2026-07-17",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_CLIENTE_PAGO_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2025-10-31",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_CLIENTE_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2025-10-31",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DETALLE_PAGO_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2025-10-31",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DETALLE_RETENCION_CC",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-04-26",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DETALLE_RETENCION_FA",
        "type": "TF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DIRECCION_CLIENTE_PAGO_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DIRECCION_CLIENTE_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DIRECCION_EMBARQUE_PAGO_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2024-05-07",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DIRECCION_EMBARQUE_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DIRECCION_PROVEEDOR_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2022-05-19",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_DOC_RELACIONADO_CFDI_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2022-05-19",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_FACTURA_LINEA_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2025-10-31",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_FACTURA_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2024-05-07",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_FACTURA_XML_RET",
        "type": "IF",
        "category": "fiscal",
        "modified": "2022-05-19",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_INV_LINEA_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_INV_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-04-26",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_PAGO_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_PROVEEDOR_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2022-05-19",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "INFO_RETENCIONES_XML",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-04-26",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "InfoUsuario",
        "type": "IF",
        "category": "otros",
        "modified": "2026-07-17",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "ObtenerDeudaCliente",
        "type": "TF",
        "category": "otros",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "ObtenerDeudaProveedores",
        "type": "TF",
        "category": "otros",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "PathAccionesModulos",
        "type": "TF",
        "category": "otros",
        "modified": "2022-05-03",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "ReportePrivilegios",
        "type": "TF",
        "category": "otros",
        "modified": "2022-05-03",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "ReporteRetaceoSelectGastos",
        "type": "TF",
        "category": "otros",
        "modified": "2023-04-26",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "ReporteRetaceoSelectImp",
        "type": "TF",
        "category": "otros",
        "modified": "2024-05-07",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "RESOLUCION_DATA",
        "type": "IF",
        "category": "fiscal",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "Rotacioninventario",
        "type": "TF",
        "category": "otros",
        "modified": "2024-05-07",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "SPLIT",
        "type": "TF",
        "category": "otros",
        "modified": "2022-05-03",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "TF_SPLIT",
        "type": "TF",
        "category": "otros",
        "modified": "2023-01-05",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "TransformarCSVaTabla",
        "type": "TF",
        "category": "otros",
        "modified": "2025-10-31",
        "definition": null,
        "encrypted": true
      },
      {
        "name": "ValoracionInventario",
        "type": "IF",
        "category": "otros",
        "modified": "2023-03-29",
        "definition": null,
        "encrypted": true
      }
    ],
    "triggersTop": [
      {
        "table": "CLIENTE",
        "n": 96
      },
      {
        "table": "CLASIFICACION",
        "n": 46
      },
      {
        "table": "ARTICULO",
        "n": 36
      },
      {
        "table": "DOCUMENTOS_CC",
        "n": 33
      },
      {
        "table": "PEDIDO",
        "n": 28
      },
      {
        "table": "U_ZONA_VENDEDOR",
        "n": 26
      },
      {
        "table": "DOCUMENTOS_CP",
        "n": 24
      },
      {
        "table": "VENDEDOR",
        "n": 22
      },
      {
        "table": "IMPUESTO",
        "n": 19
      },
      {
        "table": "ARTICULO_PRECIO",
        "n": 19
      },
      {
        "table": "AUXILIAR_CC",
        "n": 18
      },
      {
        "table": "CONDICION_PAGO",
        "n": 18
      },
      {
        "table": "MONEDA",
        "n": 18
      },
      {
        "table": "PEDIDO_LINEA",
        "n": 18
      },
      {
        "table": "PAIS",
        "n": 18
      },
      {
        "table": "DIVISION_GEOGRAFICA2",
        "n": 18
      },
      {
        "table": "EMBARQUE_LINEA",
        "n": 18
      },
      {
        "table": "DESC_PRONTO_PAGO",
        "n": 18
      },
      {
        "table": "ENTIDAD_FINANCIERA",
        "n": 18
      },
      {
        "table": "ZONA",
        "n": 18
      },
      {
        "table": "RUTA",
        "n": 18
      },
      {
        "table": "VERSION_NIVEL",
        "n": 17
      },
      {
        "table": "CUENTA_BANCARIA",
        "n": 17
      },
      {
        "table": "ARTICULO_ESPE",
        "n": 15
      },
      {
        "table": "DIVISION_GEOGRAFICA3",
        "n": 15
      }
    ],
    "triggersTotal": 4742,
    "triggersTablesCount": 877
  }
];

export const BACKBONE_NO_ACCESS = [
  {
    "instancia": "EFLOW QA/PROD (CR)",
    "db": "EFLOW_OLO / QA_MAYOREO_EFLOW / QA_SAP_EFLOW",
    "motivo": "VIEW DEFINITION no otorgado"
  },
  {
    "instancia": "EFLOW QA/PROD (VE)",
    "db": "EFLOW_BEVAL, EFLOW_FEBECA, EFLOW_SILLACA",
    "motivo": "Login denegado para el usuario de integración"
  },
  {
    "instancia": "EFLOW PROD (CR)",
    "db": "EINTEGRA_MAYOREO, EINTEGRA_COFERSA",
    "motivo": "VIEW DEFINITION no otorgado"
  },
  {
    "instancia": "SOFTLAND QA (CR)",
    "db": "PRODUSOFT",
    "motivo": "Login denegado para el usuario de integración"
  }
];
