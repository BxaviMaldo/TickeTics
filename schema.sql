--
-- PostgreSQL database dump
--

\restrict MsR5QHIv4PTzlqYEBzue7Ca4kj82oLtbtX4S1hwZFvqdg0g82FZ7ld1zbd7plbO

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: enum_tickets_estado; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tickets_estado AS ENUM (
    'abierto',
    'en_proceso',
    'resuelto',
    'cerrado'
);


--
-- Name: enum_tickets_prioridad; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_tickets_prioridad AS ENUM (
    'baja',
    'media',
    'alta',
    'critica'
);


--
-- Name: enum_usuarios_rol; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.enum_usuarios_rol AS ENUM (
    'cliente',
    'tecnico',
    'administrador'
);


--
-- Name: actualizar_marca_tiempo(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.actualizar_marca_tiempo() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: comentarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comentarios (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    usuario_id integer NOT NULL,
    contenido text NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comentarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.comentarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comentarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.comentarios_id_seq OWNED BY public.comentarios.id;


--
-- Name: estados_ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.estados_ticket (
    id_estado integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: estados_ticket_id_estado_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.estados_ticket_id_estado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: estados_ticket_id_estado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.estados_ticket_id_estado_seq OWNED BY public.estados_ticket.id_estado;


--
-- Name: prioridades_ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prioridades_ticket (
    id_prioridad integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: prioridades_ticket_id_prioridad_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prioridades_ticket_id_prioridad_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prioridades_ticket_id_prioridad_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prioridades_ticket_id_prioridad_seq OWNED BY public.prioridades_ticket.id_prioridad;


--
-- Name: registro_auditoria; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registro_auditoria (
    id integer NOT NULL,
    usuario_id integer,
    accion character varying(255) NOT NULL,
    tipo_entidad character varying(255) NOT NULL,
    id_entidad integer,
    detalles text,
    direccion_ip character varying(255),
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: registro_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registro_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registro_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registro_auditoria_id_seq OWNED BY public.registro_auditoria.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id_rol integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_rol_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_rol_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_rol_seq OWNED BY public.roles.id_rol;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    titulo character varying(255) NOT NULL,
    descripcion text NOT NULL,
    id_estado integer NOT NULL,
    id_prioridad integer NOT NULL,
    creado_por integer NOT NULL,
    asignado_a integer,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
    fecha_cierre timestamp with time zone
);


--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    correo character varying(255) NOT NULL,
    contrasena_hash character varying(255) NOT NULL,
    id_rol integer NOT NULL,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    contrasena_provisional_hash character varying(255),
    expira_provisional timestamp with time zone,
    primer_ingreso boolean DEFAULT false NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: valoraciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valoraciones (
    id integer NOT NULL,
    ticket_id integer NOT NULL,
    usuario_id integer NOT NULL,
    calificacion smallint NOT NULL,
    comentario text,
    fecha_creacion timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT valoraciones_calificacion_check CHECK (((calificacion >= 1) AND (calificacion <= 5)))
);


--
-- Name: valoraciones_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.valoraciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: valoraciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.valoraciones_id_seq OWNED BY public.valoraciones.id;


--
-- Name: comentarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios ALTER COLUMN id SET DEFAULT nextval('public.comentarios_id_seq'::regclass);


--
-- Name: estados_ticket id_estado; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados_ticket ALTER COLUMN id_estado SET DEFAULT nextval('public.estados_ticket_id_estado_seq'::regclass);


--
-- Name: prioridades_ticket id_prioridad; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prioridades_ticket ALTER COLUMN id_prioridad SET DEFAULT nextval('public.prioridades_ticket_id_prioridad_seq'::regclass);


--
-- Name: registro_auditoria id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_auditoria ALTER COLUMN id SET DEFAULT nextval('public.registro_auditoria_id_seq'::regclass);


--
-- Name: roles id_rol; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id_rol SET DEFAULT nextval('public.roles_id_rol_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: valoraciones id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valoraciones ALTER COLUMN id SET DEFAULT nextval('public.valoraciones_id_seq'::regclass);


--
-- Name: comentarios comentarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_pkey PRIMARY KEY (id);


--
-- Name: estados_ticket estados_ticket_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados_ticket
    ADD CONSTRAINT estados_ticket_nombre_key UNIQUE (nombre);


--
-- Name: estados_ticket estados_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.estados_ticket
    ADD CONSTRAINT estados_ticket_pkey PRIMARY KEY (id_estado);


--
-- Name: prioridades_ticket prioridades_ticket_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prioridades_ticket
    ADD CONSTRAINT prioridades_ticket_nombre_key UNIQUE (nombre);


--
-- Name: prioridades_ticket prioridades_ticket_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prioridades_ticket
    ADD CONSTRAINT prioridades_ticket_pkey PRIMARY KEY (id_prioridad);


--
-- Name: registro_auditoria registro_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_auditoria
    ADD CONSTRAINT registro_auditoria_pkey PRIMARY KEY (id);


--
-- Name: roles roles_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_key UNIQUE (nombre);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id_rol);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: valoraciones valoraciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_pkey PRIMARY KEY (id);


--
-- Name: valoraciones valoraciones_ticket_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_ticket_id_key UNIQUE (ticket_id);


--
-- Name: idx_auditoria_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_auditoria_usuario_id ON public.registro_auditoria USING btree (usuario_id);


--
-- Name: idx_comentarios_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comentarios_ticket_id ON public.comentarios USING btree (ticket_id);


--
-- Name: idx_comentarios_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comentarios_usuario_id ON public.comentarios USING btree (usuario_id);


--
-- Name: idx_tickets_asignado_a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_asignado_a ON public.tickets USING btree (asignado_a);


--
-- Name: idx_tickets_creado_por; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_creado_por ON public.tickets USING btree (creado_por);


--
-- Name: idx_tickets_id_estado; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_id_estado ON public.tickets USING btree (id_estado);


--
-- Name: idx_tickets_id_prioridad; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_id_prioridad ON public.tickets USING btree (id_prioridad);


--
-- Name: idx_usuarios_id_rol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_usuarios_id_rol ON public.usuarios USING btree (id_rol);


--
-- Name: idx_valoraciones_ticket_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valoraciones_ticket_id ON public.valoraciones USING btree (ticket_id);


--
-- Name: idx_valoraciones_usuario_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valoraciones_usuario_id ON public.valoraciones USING btree (usuario_id);


--
-- Name: tickets trigger_actualizar_tickets; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trigger_actualizar_tickets BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.actualizar_marca_tiempo();


--
-- Name: comentarios comentarios_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comentarios comentarios_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comentarios
    ADD CONSTRAINT comentarios_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: registro_auditoria registro_auditoria_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registro_auditoria
    ADD CONSTRAINT registro_auditoria_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_asignado_a_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: tickets tickets_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_id_estado_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_id_estado_fkey FOREIGN KEY (id_estado) REFERENCES public.estados_ticket(id_estado) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_id_prioridad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_id_prioridad_fkey FOREIGN KEY (id_prioridad) REFERENCES public.prioridades_ticket(id_prioridad) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: valoraciones valoraciones_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: valoraciones valoraciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valoraciones
    ADD CONSTRAINT valoraciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict MsR5QHIv4PTzlqYEBzue7Ca4kj82oLtbtX4S1hwZFvqdg0g82FZ7ld1zbd7plbO

