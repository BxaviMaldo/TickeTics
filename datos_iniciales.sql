--
-- PostgreSQL database dump
--

\restrict S9V7ShOwUmdffHmd09jvhZKzm5HSbDmoS8f5U1hbFU2qq3R17TEbua7UpE4iEtD

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
-- Data for Name: estados_ticket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.estados_ticket (id_estado, nombre) FROM stdin;
1	abierto
2	en_proceso
3	resuelto
4	cerrado
\.


--
-- Data for Name: prioridades_ticket; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.prioridades_ticket (id_prioridad, nombre) FROM stdin;
1	baja
2	media
3	alta
4	urgente
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id_rol, nombre) FROM stdin;
1	cliente
2	tecnico
3	administrador
\.


--
-- Name: estados_ticket_id_estado_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.estados_ticket_id_estado_seq', 4, true);


--
-- Name: prioridades_ticket_id_prioridad_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prioridades_ticket_id_prioridad_seq', 4, true);


--
-- Name: roles_id_rol_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_rol_seq', 3, true);


--
-- PostgreSQL database dump complete
--

\unrestrict S9V7ShOwUmdffHmd09jvhZKzm5HSbDmoS8f5U1hbFU2qq3R17TEbua7UpE4iEtD

