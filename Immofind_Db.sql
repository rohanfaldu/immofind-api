--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

-- Started on 2025-01-03 15:51:00

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
-- TOC entry 5 (class 2615 OID 76736)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 921 (class 1247 OID 77013)
-- Name: agency_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.agency_type AS ENUM (
    'BASIC',
    'STANDARD',
    'PREMIUM'
);


ALTER TYPE public.agency_type OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 76774)
-- Name: login_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.login_type AS ENUM (
    'GOOGLE',
    'FACEBOOK',
    'NONE'
);


ALTER TYPE public.login_type OWNER TO postgres;

--
-- TOC entry 870 (class 1247 OID 76768)
-- Name: property_option_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.property_option_enum AS ENUM (
    'NAME',
    'CHECKBOX'
);


ALTER TYPE public.property_option_enum OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 76782)
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'USER',
    'ADMIN'
);


ALTER TYPE public.role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 237 (class 1259 OID 77082)
-- Name: _DevelopersToAgencyPackages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_DevelopersToAgencyPackages" (
    "A" uuid NOT NULL,
    "B" uuid NOT NULL
);


ALTER TABLE public."_DevelopersToAgencyPackages" OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 76737)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 76787)
-- Name: agencies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agencies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credit character varying,
    facebook_link character varying,
    twitter_link character varying,
    youtube_link character varying,
    pinterest_link character varying,
    linkedin_link character varying,
    instagram_link character varying,
    whatsup_number character varying,
    tax_number character varying,
    license_number character varying,
    agency_packages uuid,
    picture character varying,
    cover character varying,
    meta_id uuid,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    publishing_status_id integer DEFAULT 1 NOT NULL,
    sub_user_id uuid,
    country_code character varying,
    description uuid,
    service_area uuid
);


ALTER TABLE public.agencies OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 76798)
-- Name: agency_packages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.agency_packages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type public.agency_type NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    name uuid
);


ALTER TABLE public.agency_packages OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 76809)
-- Name: cities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    state_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    lang_id uuid,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.cities OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 77207)
-- Name: currency; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    symbol character varying NOT NULL,
    name character varying NOT NULL,
    status boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.currency OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 77070)
-- Name: developers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.developers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text,
    email character varying,
    phone character varying,
    address text,
    password text,
    "facebookLink" character varying,
    "twitterLink" character varying,
    "youtubeLink" character varying,
    "pinterestLink" character varying,
    "linkedinLink" character varying,
    "instagramLink" character varying,
    "whatsappPhone" character varying,
    "taxNumber" character varying,
    "licenseNumber" character varying,
    "publishingStatusId" bigint DEFAULT 1,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    agency_package_id text,
    credit character varying,
    country_code character varying,
    description uuid,
    "serviceArea" uuid
);


ALTER TABLE public.developers OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 76820)
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    city_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    lang_id uuid,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 76831)
-- Name: lang_translations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lang_translations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    en_string character varying NOT NULL,
    fr_string character varying,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.lang_translations OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 76842)
-- Name: meta_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meta_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying NOT NULL,
    description text,
    keyword text,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.meta_data OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 77027)
-- Name: neighborhoods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.neighborhoods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    district_id uuid NOT NULL,
    lang_id uuid,
    latitude double precision,
    longitude double precision,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.neighborhoods OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 77036)
-- Name: project_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    state_id uuid NOT NULL,
    city_id uuid NOT NULL,
    district_id uuid NOT NULL,
    vr_link character varying,
    video character varying,
    status boolean DEFAULT false NOT NULL,
    user_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    title uuid NOT NULL,
    description uuid NOT NULL,
    neighborhoods_id uuid,
    address character varying,
    latitude double precision,
    longitude double precision,
    currency_id uuid,
    price integer NOT NULL,
    icon character varying,
    picture text[]
);


ALTER TABLE public.project_details OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 77048)
-- Name: project_meta_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_meta_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_detail_id uuid NOT NULL,
    value character varying NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    project_type_listing_id uuid NOT NULL
);


ALTER TABLE public.project_meta_details OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 77059)
-- Name: project_type_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_type_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    icon character varying,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    name uuid NOT NULL,
    type character varying,
    key character varying,
    category bigint NOT NULL,
    status boolean DEFAULT false NOT NULL
);


ALTER TABLE public.project_type_listings OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 76853)
-- Name: property_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    price integer NOT NULL,
    state_id uuid,
    city_id uuid,
    district_id uuid NOT NULL,
    vr_link character varying,
    video character varying,
    status boolean DEFAULT false NOT NULL,
    user_id uuid NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    project_id uuid,
    size integer,
    transaction character varying NOT NULL,
    type uuid NOT NULL,
    title uuid NOT NULL,
    description uuid NOT NULL,
    picture text[],
    currency_id uuid,
    neighborhoods_id uuid,
    address character varying,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.property_details OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 76865)
-- Name: property_meta_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_meta_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    property_detail_id uuid NOT NULL,
    value character varying NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    property_type_id uuid NOT NULL
);


ALTER TABLE public.property_meta_details OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 76876)
-- Name: property_type_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_type_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    icon character varying,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    category bigint NOT NULL,
    key character varying,
    type character varying,
    name uuid NOT NULL,
    status boolean DEFAULT false NOT NULL
);


ALTER TABLE public.property_type_listings OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 76887)
-- Name: property_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.property_types (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    title uuid,
    status boolean DEFAULT false NOT NULL
);


ALTER TABLE public.property_types OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 76898)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_date timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    status boolean DEFAULT true
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 76910)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key character varying NOT NULL,
    value character varying NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 76921)
-- Name: states; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.states (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by uuid,
    updated_by uuid,
    lang_id uuid,
    latitude double precision,
    longitude double precision
);


ALTER TABLE public.states OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 76932)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name character varying,
    user_name character varying,
    fcm_token character varying,
    password character varying,
    email_address character varying,
    address text,
    reset_password_token integer,
    image character varying,
    user_login_type public.login_type NOT NULL,
    is_deleted boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    role_id uuid NOT NULL,
    status boolean DEFAULT true,
    country_code character varying,
    email_password_code integer,
    phone_password_code integer,
    social_id character varying,
    mobile_number bigint
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5084 (class 0 OID 77082)
-- Dependencies: 237
-- Data for Name: _DevelopersToAgencyPackages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_DevelopersToAgencyPackages" ("A", "B") FROM stdin;
\.


--
-- TOC entry 5064 (class 0 OID 76737)
-- Dependencies: 217
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
8a7da7d1-a849-45eb-a1f4-7db4b1dfd5f1	063c80fe5a8a1c0f7201d5905e8f214318b2d3c6793e5c9355645d5ac80b341d	2024-12-31 12:52:41.796873+05:30	20241231071313_add_price_in_to_project_details	\N	\N	2024-12-31 12:52:41.791249+05:30	1
905de0e0-3467-4e5f-857b-290f4a0a6654	12772aab97e43e12939ba8eeba2bc532769031e7cd43c52405da08429085afa4	2024-12-31 12:52:41.551417+05:30	20241014082205_update_user_model	\N	\N	2024-12-31 12:52:41.541964+05:30	1
df9199b0-dfd9-4111-aaef-859669f1e503	b93d72ce01632069f593e9c7692ef157608925ea57d561aa802297aa609edf76	2024-12-31 12:52:41.769567+05:30	20241225125714_add_address_to_property_details	\N	\N	2024-12-31 12:52:41.766534+05:30	1
c181e826-531a-4392-ab4a-67c1ce7df968	0b7b3f22541745c338ca10608b197e686d23f98e205b80f9b4c4342a02e2cb6f	2024-12-31 12:52:41.636467+05:30	20241115090221_add_fields_to_states	\N	\N	2024-12-31 12:52:41.552718+05:30	1
36a9061e-58c3-4350-8198-ff10ef18f0bc	0e21b980df2b6ede7a810d7f2da88c01ca28bf66e5ec1410198849c30a205a9b	2024-12-31 12:52:41.640383+05:30	20241115091330_add_fields_to_lang_id	\N	\N	2024-12-31 12:52:41.637308+05:30	1
073a4997-43a7-43d0-8e8a-d2e32736110d	6abaf520e64e310c03ff0d228779e86456c2b8b1d1e86cae7ab665ce3397c131	2024-12-31 12:52:41.648038+05:30	20241115092723_add_fields_to_lang_id_relationship_new	\N	\N	2024-12-31 12:52:41.641316+05:30	1
c725b813-e52a-46c6-838b-474acecb877c	08803ad6b0acc66cb3c0abfa85530a91b694859b807d69d360bf9ffe9f27b1e5	2024-12-31 12:52:41.773164+05:30	20241225130418_add_address_to_project_details	\N	\N	2024-12-31 12:52:41.770351+05:30	1
e6dd2370-1039-4bb9-b685-2a2cbdc6b18a	60a1cde28d6e9d49a7a04d6c2c376a76466243a00bb5f11a107d9cc945216c36	2024-12-31 12:52:41.656116+05:30	20241115094513_add_fields_to_lang_id_relationship_cities_table	\N	\N	2024-12-31 12:52:41.649026+05:30	1
89d3b78f-70f6-47e3-9033-ce90a33a56b6	2f120628e21c000bf4647e906aff45d637f4d4e57e66258d5bed26d6290099d0	2024-12-31 12:52:41.664468+05:30	20241116053312_add_district_fields	\N	\N	2024-12-31 12:52:41.65692+05:30	1
4c31b57e-6e8b-4466-be12-2a1abbdad6a9	2e982760b7cebdd87d9b481ae86eb12deacd281db58af73ca1586c9bbce7d138	2024-12-31 12:52:41.732946+05:30	20241224071721_country_code	\N	\N	2024-12-31 12:52:41.665485+05:30	1
1f8fff09-8860-4e0a-9e53-324b302d35cb	7001e1b9aa494ceb7142178afa110ac72e69b5e568a48dbd5a1359e1b25a00a1	2024-12-31 12:52:41.776386+05:30	20241225131802_add_country_code_agency	\N	\N	2024-12-31 12:52:41.773847+05:30	1
ca96e19a-b0d9-4b09-b288-817c6338f0a3	533168524de49af2382c04adfed76c40b4635fe0a9aaab32b08cdfc4f42a5100	2024-12-31 12:52:41.737136+05:30	20241224115937_status	\N	\N	2024-12-31 12:52:41.733848+05:30	1
3fcb7b89-edfc-43e6-80d9-6e8a66626f0a	a87858e56814738854a1892d732db3977ec9a6e958f9d1e4d58800dc18be17bc	2024-12-31 12:52:41.741517+05:30	20241224122328_status	\N	\N	2024-12-31 12:52:41.737952+05:30	1
1330a96f-f6f9-4c52-9e56-c5ba9912c4da	c88c9fd4e97d0cac541d810bee48b5c7eecc6e90b9ac749277ebfbc56e493dde	2024-12-31 12:53:09.654181+05:30	20241231072309_add_price_into_project	\N	\N	2024-12-31 12:53:09.650917+05:30	1
3e3ea51b-bab9-46b8-9efe-5d7852c0a094	7083db04f43f6c34a256b5fb577616082206b891da7f4e6ed0366c594fbde6af	2024-12-31 12:52:41.74666+05:30	20241224123614_status	\N	\N	2024-12-31 12:52:41.742799+05:30	1
808b234f-8bf6-4e45-89a1-cca9f161565b	45e17e5b94f507aceb2f3a684efcffa73d07f0ec4ee986eab61f94bd4e84dff4	2024-12-31 12:52:41.780309+05:30	20241226050350_add_country_code_developers	\N	\N	2024-12-31 12:52:41.777218+05:30	1
70d3f3d8-167d-4fa4-b84b-fd3f0781b57a	0805efd935b129049a7782d4e1358eeb12b655c9bc19a59cdbd98bbfbaa30170	2024-12-31 12:52:41.756169+05:30	20241224131607_add_currency_table	\N	\N	2024-12-31 12:52:41.747427+05:30	1
5117680f-aced-46eb-a1b7-3bfd79fe5cdb	1a082ef0ac36f52c381253f820c679b3e2fd2659cef9ef6528720353c0927e77	2024-12-31 12:52:41.761099+05:30	20241225094609_add_neighbourhood_id_to_proprty	\N	\N	2024-12-31 12:52:41.756838+05:30	1
27c63c70-6c83-4094-a991-ac82f0f6266f	b9cbf2f2a90fe52963845065c740f1a4c07495111ca8a03493495d5514eac4b0	2024-12-24 12:47:16.253108+05:30	20241014082205_update_user_model	\N	\N	2024-12-24 12:47:16.241571+05:30	1
993c25ef-04d3-4986-b588-146b2b676d56	77dd6790286cb7a5cec7d2e3a553fd5467a28eeea526aae48f6a610847ede447	2024-12-31 12:52:41.765763+05:30	20241225095943_add_neighbourhood_id_to_project	\N	\N	2024-12-31 12:52:41.761975+05:30	1
7cfb6bd0-5e28-4f0f-9396-4948915a0d23	6444cf068304613067591569a5d7ee9a7dfcce20961e643d4f66c3573f66334b	2024-12-31 12:52:41.78363+05:30	20241226093606_change_datatype_latitude_longitude_fields_property_details_table	\N	\N	2024-12-31 12:52:41.780927+05:30	1
0a71a63f-33f8-4f2c-adb0-5b0dff2e43db	7ab3765a50c4280b89c25e1a48cbe31669098f85cef95884eaeb1e24c3231c0e	2024-12-24 12:47:16.378367+05:30	20241115090221_add_fields_to_states	\N	\N	2024-12-24 12:47:16.254161+05:30	1
cd91b1b3-9722-4fca-8d2c-2290cd883e84	dfbb5f488035200012da8eddb1c472db739e3b6d6c301d94a06529a56ef9073c	2024-12-31 12:52:41.787191+05:30	20241226095711_change_datatype_latitude_longitude_fields_project_details_table	\N	\N	2024-12-31 12:52:41.784457+05:30	1
19f6d814-f78b-4959-8361-a821ea05e586	456489ad269b5b0526bb98ff906d9705f454866f58c53816c56eb17622bdbcb4	2024-12-24 12:47:16.38129+05:30	20241115091330_add_fields_to_lang_id	\N	\N	2024-12-24 12:47:16.379014+05:30	1
4138d8de-3c65-4c14-9f02-fd537c2ddf17	950ab6d181de7a9abb1ffcd3b6fcd679179c8b0f46e3bf4658375c97db4b84d4	2024-12-31 12:52:41.790222+05:30	20241226100305_remove_price_field_project_details_table	\N	\N	2024-12-31 12:52:41.787861+05:30	1
855eefad-b385-443b-9e6e-cadb0ba87c95	31353ef44146a72a7d3aaa23b1761eb9553d6031311d7a2baa5adb4985a9e53d	2025-01-01 16:32:04.741966+05:30	20250101110204_add_icon_field_to_project_details	\N	\N	2025-01-01 16:32:04.734353+05:30	1
8f1d3fab-029c-418b-a7eb-35eacb139c8f	9bd2501e07af74e748af18a3c4841c9c4a335bc0c22653f64172696f4f90aa05	2024-12-24 12:47:16.386226+05:30	20241115092723_add_fields_to_lang_id_relationship_new	\N	\N	2024-12-24 12:47:16.381945+05:30	1
2cc07143-9ba0-433a-a28c-992a79aec27b	11753d1c6b77698bfe37abe422f15db6e0834711da4d810afdec5beb81bb2daf	2024-12-24 12:47:16.394937+05:30	20241115094513_add_fields_to_lang_id_relationship_cities_table	\N	\N	2024-12-24 12:47:16.386867+05:30	1
90a6d907-3d0b-44c8-b8e5-022e3a2a5638	b0d2deba3e343ea7f906f33a8baf7f5fea3162f45d280740bbbae72bd49a9957	2024-12-24 12:47:16.401097+05:30	20241116053312_add_district_fields	\N	\N	2024-12-24 12:47:16.395547+05:30	1
f95b0843-6eac-453f-adb6-3ab40a94dc64	2e982760b7cebdd87d9b481ae86eb12deacd281db58af73ca1586c9bbce7d138	2024-12-24 12:47:22.084647+05:30	20241224071721_country_code	\N	\N	2024-12-24 12:47:21.978275+05:30	1
72109bf8-eca5-4cfc-8b85-83e73d33ad97	533168524de49af2382c04adfed76c40b4635fe0a9aaab32b08cdfc4f42a5100	2024-12-24 17:29:37.388942+05:30	20241224115937_status	\N	\N	2024-12-24 17:29:37.380508+05:30	1
f316b655-ff16-40d0-8c17-6f5831581f57	a87858e56814738854a1892d732db3977ec9a6e958f9d1e4d58800dc18be17bc	2024-12-24 17:53:28.043136+05:30	20241224122328_status	\N	\N	2024-12-24 17:53:28.037618+05:30	1
9f5c8dea-ffaf-4a6a-b3d6-def5fdf728e2	7083db04f43f6c34a256b5fb577616082206b891da7f4e6ed0366c594fbde6af	2024-12-24 18:06:14.049283+05:30	20241224123614_status	\N	\N	2024-12-24 18:06:14.042813+05:30	1
6a8227ec-8d9d-4d7e-999d-e6bb674603e8	0805efd935b129049a7782d4e1358eeb12b655c9bc19a59cdbd98bbfbaa30170	2024-12-24 18:46:07.672099+05:30	20241224131607_add_currency_table	\N	\N	2024-12-24 18:46:07.653732+05:30	1
0aee230e-8501-4896-986b-98b10df84de4	ab0f9500b0473d3553f7bbbe49175ec89ff031f2126ff17af853507a79283f39	2025-01-02 10:33:20.989586+05:30	20250102050320_remove_link_uuid_to_property_and_project	\N	\N	2025-01-02 10:33:20.984+05:30	1
60f1d2aa-fcb6-4c2f-ac41-6a1629b4ecec	b65832b1b89ec6df3e4a87ac67bfd173dae2128313944740086b3ad0b051bf91	2025-01-02 11:35:01.683099+05:30	20250102060501_add_translation_to_agency	\N	\N	2025-01-02 11:35:01.668269+05:30	1
b383b400-b991-441f-bf5d-a288f9d5ff1e	ae0a158f4c4fd8f38377a965ed3e1ea063fa09e5e8a6b7c730e9d6a10af8bed7	2025-01-02 12:28:52.78372+05:30	20250102065852_add_translation_to_developer	\N	\N	2025-01-02 12:28:52.769873+05:30	1
\.


--
-- TOC entry 5065 (class 0 OID 76787)
-- Dependencies: 218
-- Data for Name: agencies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agencies (id, user_id, credit, facebook_link, twitter_link, youtube_link, pinterest_link, linkedin_link, instagram_link, whatsup_number, tax_number, license_number, agency_packages, picture, cover, meta_id, is_deleted, created_at, updated_at, created_by, updated_by, publishing_status_id, sub_user_id, country_code, description, service_area) FROM stdin;
820d2656-245f-47e0-ac35-47e5c859ba25	795b83c9-ecbf-496b-9efc-0acb6e2864b5	1000	https://facebook.com/example	https://twitter.com/example	https://youtube.com/example	https://pinterest.com/example	https://linkedin.com/example	https://instagram.com/example	1234567890	123456789	XYZ1234	9a9cf5d6-d0c0-476a-a068-223974712e53	urltopicture.jpg	urltocoverimage.jpg	\N	f	2025-01-03 04:36:08.082	2025-01-03 04:36:08.082	795b83c9-ecbf-496b-9efc-0acb6e2864b5	\N	1	\N	+91	f3812268-dd94-4e5a-a56d-1cbe020c0c8a	ae57de1f-7608-4d4e-8c5c-b264726f3721
1970fcd6-d1d7-4413-9957-4a62e3204d18	9fa98519-324f-4636-aba5-b5aae388e697	1000	https://facebook.com/example	https://twitter.com/example	https://youtube.com/example	https://pinterest.com/example	https://linkedin.com/example	https://instagram.com/example	1234567890	123456789	XYZ1234	9a9cf5d6-d0c0-476a-a068-223974712e53	urltopicture.jpg	urltocoverimage.jpg	\N	f	2025-01-03 04:43:04.15	2025-01-03 04:43:04.15	795b83c9-ecbf-496b-9efc-0acb6e2864b5	\N	1	\N	+91	c4441ae8-0cff-480c-88ef-e66b20a13e41	f5607d04-887e-44d9-a495-d15095553f26
5714b43f-eebc-41c0-9255-87a0cfa7fe47	7aa1e66a-1ee9-40b5-94d3-d5c5a20bc642	1500	https://facebook.com/updated-example	https://twitter.com/updated-example	https://youtube.com/updated-example	https://pinterest.com/updated-example	https://linkedin.com/updated-example	https://instagram.com/updated-example	9876543210	987654321	XYZ9876	9a9cf5d6-d0c0-476a-a068-223974712e53	new-urltopicture.jpg	new-urltocoverimage.jpg	\N	f	2025-01-03 04:43:33.175	2025-01-03 05:08:41.736	795b83c9-ecbf-496b-9efc-0acb6e2864b5	795b83c9-ecbf-496b-9efc-0acb6e2864b5	1	\N	+91	52922123-759f-4b78-b334-55444d9afd6f	d5a05f71-fdb9-473c-a624-e3eb0c35db0e
\.


--
-- TOC entry 5066 (class 0 OID 76798)
-- Dependencies: 219
-- Data for Name: agency_packages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.agency_packages (id, type, is_deleted, created_at, updated_at, created_by, updated_by, name) FROM stdin;
9a9cf5d6-d0c0-476a-a068-223974712e53	BASIC	f	2025-01-01 10:37:20.736	2025-01-01 10:37:20.739	02ba106a-ab74-46f7-a9df-f8e62621bdd1	\N	c4f3307f-3a83-457e-ba81-891de465c02a
\.


--
-- TOC entry 5067 (class 0 OID 76809)
-- Dependencies: 220
-- Data for Name: cities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cities (id, state_id, is_deleted, created_at, updated_at, created_by, updated_by, lang_id, latitude, longitude) FROM stdin;
335f4643-df88-4dd4-8a4b-a11357dda2a6	7d835311-8b5b-4b02-b7d5-4bc4d90469d0	f	2025-01-01 05:07:53.682	2025-01-02 09:46:21.17	02ba106a-ab74-46f7-a9df-f8e62621bdd1	02ba106a-ab74-46f7-a9df-f8e62621bdd1	31a5f4e3-509f-4bec-9e31-4783c9a3190e	21.1702	72.8311
8afc0b29-a778-42f2-968b-85015a735d65	7d835311-8b5b-4b02-b7d5-4bc4d90469d0	f	2025-01-01 05:05:12.802	2025-01-02 11:15:45.334	02ba106a-ab74-46f7-a9df-f8e62621bdd1	02ba106a-ab74-46f7-a9df-f8e62621bdd1	e0b586ae-7c75-4599-946f-fe5ff3b68044	23.125	72.0536
\.


--
-- TOC entry 5085 (class 0 OID 77207)
-- Dependencies: 238
-- Data for Name: currency; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.currency (id, symbol, name, status, "createdAt", "updatedAt") FROM stdin;
5a6a800e-8290-4c85-988f-04699c01db1d	$	dollar	t	2024-12-24 13:20:24.413	2024-12-24 13:20:24.413
2ebc6b07-0027-48b5-9929-4dd8dd8daf56	€	europ	t	2024-12-24 13:34:15.678	2024-12-24 13:35:08.546
\.


--
-- TOC entry 5083 (class 0 OID 77070)
-- Dependencies: 236
-- Data for Name: developers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.developers (id, user_id, name, email, phone, address, password, "facebookLink", "twitterLink", "youtubeLink", "pinterestLink", "linkedinLink", "instagramLink", "whatsappPhone", "taxNumber", "licenseNumber", "publishingStatusId", is_deleted, created_at, updated_at, created_by, updated_by, agency_package_id, credit, country_code, description, "serviceArea") FROM stdin;
f8ab6188-80e1-4697-abbf-7aafb7cc0308	39a4c829-4a98-4b57-a510-baaf96df1f90	\N	\N	\N	\N	\N	https://facebook.com/john.doe	https://twitter.com/john_doe	\N	\N	https://linkedin.com/in/johndoe	\N	1234567894	TAX12345	LIC45678	1	f	2025-01-03 05:35:16.677	2025-01-03 05:35:16.677	795b83c9-ecbf-496b-9efc-0acb6e2864b5	\N	\N	100	+91	56a2475e-9a66-4c2c-9cbb-96dfc7ae0d29	b2288c90-1112-4293-83c3-5590be1ecfc3
85d56680-f761-4d4b-bc51-8736a2226bd2	5a7e2d1c-6624-4ce0-933f-fa4cad35eb57	\N	\N	\N	\N	\N	https://facebook.com/john.doe	https://twitter.com/john_doe	\N	\N	https://linkedin.com/in/johndoe	\N	1234567894	TAX12345	LIC45678	1	f	2025-01-03 05:35:39.546	2025-01-03 05:35:39.546	795b83c9-ecbf-496b-9efc-0acb6e2864b5	\N	\N	100	+91	7c11b111-f158-4f39-b038-a12ec2155070	c9768f7a-8050-4cf4-a101-105b256cf4f1
d3c9ec40-5ee4-4787-9631-f4774978fdbf	31950c69-b8bb-4de8-bfb3-05c1a20fcf1a	\N	\N	\N	\N	\N	https://facebook.com/john.doe	https://twitter.com/john_doe	\N	\N	https://linkedin.com/in/johndoe	\N	1234567894	TAX12345	LIC45678	1	f	2025-01-02 07:25:30.849	2025-01-03 06:08:58.113	795b83c9-ecbf-496b-9efc-0acb6e2864b5	795b83c9-ecbf-496b-9efc-0acb6e2864b5	\N	100	+91	70334322-2076-42fa-97bc-2dd1273179db	3e139604-3727-434f-b3c4-1745a139103a
\.


--
-- TOC entry 5068 (class 0 OID 76820)
-- Dependencies: 221
-- Data for Name: districts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.districts (id, city_id, is_deleted, created_at, updated_at, created_by, updated_by, lang_id, latitude, longitude) FROM stdin;
afe080a5-eb93-4f0b-9998-14e51afff547	8afc0b29-a778-42f2-968b-85015a735d65	f	2025-01-02 10:53:00.313	2025-01-02 10:53:00.313	02ba106a-ab74-46f7-a9df-f8e62621bdd1	\N	56909ed3-c203-42f3-8df6-904a7f118f19	23.125	72.0536
2b24770c-ca1e-42c7-b36f-53206fda8e94	8afc0b29-a778-42f2-968b-85015a735d65	f	2025-01-02 11:07:50.919	2025-01-02 11:07:50.919	02ba106a-ab74-46f7-a9df-f8e62621bdd1	\N	69bcae4d-4f06-4556-98f2-4054b84e4640	23.1013	20.2323
bf7c4508-7067-45d3-b9dc-19674a5c3cbc	8afc0b29-a778-42f2-968b-85015a735d65	f	2025-01-02 11:08:37.699	2025-01-02 11:08:37.699	02ba106a-ab74-46f7-a9df-f8e62621bdd1	\N	63b895bc-b41e-4d54-9fb7-40f601a28a77	20.2323	71.5724
\.


--
-- TOC entry 5069 (class 0 OID 76831)
-- Dependencies: 222
-- Data for Name: lang_translations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lang_translations (id, en_string, fr_string, is_deleted, created_at, updated_at, created_by, updated_by) FROM stdin;
1ac1ed01-a333-4349-a458-0959b6e38d7c	appartement	appartement	f	2024-11-26 17:24:58.051292	2024-11-26 17:24:58.051292	\N	\N
1a75b6ed-94e2-4087-8144-9997b72e65d9	maison	maison	f	2024-11-26 17:24:58.051292	2024-11-26 17:24:58.051292	\N	\N
428add31-4d2c-44ec-a10a-ba79ab1e6065	villa	villa	f	2024-11-26 17:24:58.051292	2024-11-26 17:24:58.051292	\N	\N
9ad13be7-aa16-456b-b554-03f1c44a72f7	bureau	bureau	f	2024-11-26 17:24:58.051292	2024-11-26 17:24:58.051292	\N	\N
f773a4d3-501f-42b7-bc5f-f225d18402fa	Rooms	Chambres	f	2024-11-26 17:31:24.771715	2024-11-26 17:31:24.771715	\N	\N
2c595e5e-fb64-4b3f-b40e-be4831ecc918	Bathrooms	Salles de bain	f	2024-11-26 17:31:24.771715	2024-11-26 17:31:24.771715	\N	\N
76ce2eaf-f63f-4b7f-aef4-6e02fee1fb4a	Fairs	Salons	f	2024-11-26 17:31:24.771715	2024-11-26 17:31:24.771715	\N	\N
fc9e143b-3fb3-4490-8354-63fd7eeb7f52	Furniture	Meublé	f	2024-11-26 17:31:24.771715	2024-11-26 17:31:24.771715	\N	\N
459e143b-3fb3-4490-8354-63fd7eeb7f52	Loticio offers you this magnificent furnished villa for long-term rental with impeccable finishing and quality materials, the villa has a garden and an outdoor swimming pool.\nIt is composed of: \n- 3 lounges \n- a dining area \n- an equipped kitchen \n- 3 bathrooms \n- 3 bedrooms \n- a swimming pool and a large outdoor garden \nPlease note that the villa is located in a magnificent secure residence close to all amenities.\n\nRent: 40,000 dhs	Loticio vous propose cette magnifique villa meublée à la location longue durée avec une finition impeccable et des matériaux de qualité, la villa est est dotée dun jardin et une piscine extérieure.\nElle est composée de : \n- 3 salons \n- un coin salle à manger \n- une cuisine équipée \n- 3 salles de bain \n- 3 chambres \n- une piscine et un grand jardin extérieur \nA noter que la villa se situe dans une magnifique résidence securisée proche de toutes les commodités.\n\nLoyer : 40000 dhs	f	2024-11-26 17:39:44.247087	2024-11-26 17:39:44.247087	\N	\N
c8371c2d-7931-4962-af80-a2cf5871c075	Dar Bouazza	Dar Bouazza	f	2024-11-26 12:13:26.551	2024-11-26 12:13:26.551	\N	\N
d36791b4-8960-488d-b42a-577fef56cc66	Casablanca-Settat	Casablanca-Settat	f	2024-11-26 12:13:46.171	2024-11-26 12:13:46.171	\N	\N
b932badc-ab79-4e55-8363-68dae6cd1967	Dar Bouazza	Dar Bouazza	f	2024-11-26 12:13:50.563	2024-11-26 12:13:50.563	\N	\N
5a47acd4-7658-41cf-b1f7-1edab1e18396	Dar Bouazza	Dar Bouazza	f	2024-11-26 12:14:02.969	2024-11-26 12:14:02.969	\N	\N
d23f3816-06b3-45c0-9be1-50083a3b4a44	Dar Bouazza	Dar Bouazza	f	2024-11-26 12:14:18.334	2024-11-26 12:14:18.334	\N	\N
3473a4d3-501f-42b7-bc5f-f225d18402fa	Loticio offers you this magnificent apartment composed of: \n-A magnificent living room with terrace \n- 2 bedrooms \n- 2 bathrooms\n- Terrace with sea view\n-A parking space.\n-A magnificent kitchen \nNote that the project has a swimming pool and gives direct access to the beach.\nPrice per night: \n2200 dhs in May/June/July\n2500 dhs in August	Loticio vous propose ce magnifique appartement composé de : \n-Un magnifique salon avec terrasse \n- 2 chambres \n- 2 salles de bain\n- Terrasse avec vue sur mer\n-Une place de parking.\n-Une magnifique cuisine \nA noter que le projet est doté d'une piscine et donne un accès direct à la plage.\nPrix par nuit: \n2200 dhs en mai/juin/juillet\n2500 dhs en août	f	2024-11-26 20:41:55.459702	2024-11-26 20:41:55.459702	\N	\N
349e143b-3fb3-4490-8354-63fd7eeb7f52	Splendid Villa For Long Term Rent In Dar Bouazza	Splendide Villa A La Location Longue Duree Sur Dar Bouazza	f	2024-11-26 17:39:44.247087	2024-11-26 17:39:44.247087	\N	\N
36028a80-10a9-48cb-ae8d-f210d8b008c0	Short Term Rental Apartment Darbouazza	Appartement Location Courte Duree Darbouazza	f	2024-11-26 20:37:38.318691	2024-11-26 20:37:38.318691	\N	\N
a8b42e2b-9d9d-4648-abca-f41eaaac4f5b	Dining room	Salle à manger	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
62eed3ec-a045-4047-ade7-e32076aeb72e	Garden	Jardin	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
af551be4-e484-4d37-b16a-b0e8587bed15	Pool	Piscine	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
6887e157-8a5a-4b8e-961f-e88499b9f9a6	Equipped kitchen	Cuisine équipée	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
cace6dbb-a88f-4d6e-9144-71a1a3b33b2f	Secure residence	Résidence sécurisée	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
e3f0aa37-67f6-4cc9-9e15-0a70e5339471	Terrasse	Terrasse	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
85fbf420-c614-4b70-9b7f-642d9889c17f	Parking	Parking	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
35009945-773b-4901-9954-80d96376a02f	Elevator	Ascenseur	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
afdb42c9-628d-4ce4-9561-45770d5bb55b	Chimney	Cheminée	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
21d0a263-b975-4312-92c5-2277c0b61d8c	Central Air Conditioning	Climatisation Centrale	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
55e15599-7c6b-40ba-9855-796958912af8	Central Heating	Chauffage Central	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
b86e7e34-a043-4fb6-bb33-57eb53d8d61f	Double Glazing	Double Vitrage	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
c7ffdcea-0576-435d-ba0c-44daec22dee9	Dressing room	Dressing	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
c4ba03e7-b072-43ae-9963-c36b6cf64448	Green Space	Espace Vert	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
d1fe34e4-071c-4af1-91bc-1a44d30c1758	Garage	Garage	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
bef53dd1-dd65-42bc-b212-e2f96e897260	Rental Investment	Investissement Locatif	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
951fa7f6-59ec-460e-9fd7-6555ad3f6e97	Premium Finish	Finition Premium	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
6a47232c-dfb3-4de3-be6c-d106ba4ecb8d	New Project	Projet Neuf	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
d872c760-d78f-463f-a865-b91080654551	Gym	Salle de Sport	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
45bd4d25-3437-4f7a-b63f-88d804b9d3af	Security	Sécurité	f	2024-11-26 23:57:32.459729	2024-11-26 23:57:32.459729	\N	\N
7e532bc4-0b85-4c3b-8957-86a456e4cffa	California	Californie	f	2024-12-09 10:21:25.713	2024-12-09 10:21:25.713	\N	\N
d7dbc576-d286-42ed-a8d8-92ecb5804d1b	Casablanca	Casablanca	f	2024-12-09 10:21:41.353	2024-12-09 10:21:41.353	\N	\N
8410aa07-8c21-43bb-9a68-b8e81ab9078e	Oulfa	Oulfa	f	2024-12-09 10:22:12.721	2024-12-09 10:22:12.721	\N	\N
7f450767-118b-4537-a66e-2314d5159e92	Chambres	Chambres	f	2024-12-09 10:23:43.169	2024-12-09 10:23:43.169	39e7570b-405f-46c8-89a8-55505c695c5c	\N
14a68d22-2a4c-4ea2-b132-00075e385979	Bathroom	Salles de bain	f	2024-12-09 10:35:44.134	2024-12-09 10:35:44.134	39e7570b-405f-46c8-89a8-55505c695c5c	\N
47329297-158a-4628-bc6d-ee0cb7a8da8a	Elevator	Elevator	f	2024-12-09 10:36:13.3	2024-12-09 10:36:13.3	39e7570b-405f-46c8-89a8-55505c695c5c	\N
93add89c-f4bd-4bb2-83ed-bb3249ce245f	Pool	pool	f	2024-12-09 10:36:36.587	2024-12-09 10:36:36.587	39e7570b-405f-46c8-89a8-55505c695c5c	\N
c96613d4-546f-4dba-be1a-5f70b19e4251	Basic Package test	Forfait de base	f	2024-12-10 05:16:57.841	2024-12-10 05:16:57.841	82c60ff0-de39-48c4-88fb-556a1c328b5f	\N
708042a7-b70a-451c-a3fe-246d654a4139	Package test	Forfait	f	2024-12-10 06:34:30.582	2024-12-10 06:34:30.582	e853ede7-bab5-4746-807a-e46cb3f28171	\N
fa32faac-3985-4fdd-982b-e7da60626c0e	Modern Apartment	Appartement Moderne	f	2024-12-10 08:56:12.974	2024-12-10 08:56:12.974	4ea190b6-6484-4178-b2f3-9c53718af1a8	\N
ffd9f5a4-c1b0-4afc-ad9f-5da8c93ed8b4	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-10 08:56:12.991	2024-12-10 08:56:12.991	4ea190b6-6484-4178-b2f3-9c53718af1a8	\N
a55c5375-bae0-4772-8b00-42f759443fd8	Modern Apartment	Appartement Moderne	f	2024-12-10 08:58:30.441	2024-12-10 08:58:30.441	4ea190b6-6484-4178-b2f3-9c53718af1a8	\N
507a3e8e-6a9d-4182-9c2a-62720612a939	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-10 08:58:30.456	2024-12-10 08:58:30.456	4ea190b6-6484-4178-b2f3-9c53718af1a8	\N
297280af-68cc-488c-a9de-2cdbaad544b8	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 10:32:29.165	2024-12-10 10:32:29.165	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
01d6d076-e768-4299-9781-d9e81f3e4c97	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 10:32:29.172	2024-12-10 10:32:29.172	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
71b33d3f-e981-48fe-8b53-9118a3161105	Ain Sebaa	Ain Sebaa	f	2024-12-10 10:35:47.711	2024-12-10 10:35:47.711	\N	\N
abc9e76e-c5d2-46ac-bed4-cecba4ad2f1a	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 10:47:48.454	2024-12-10 10:47:48.454	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
cf1196dd-79ce-4082-9730-9ea9e2087013	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 10:47:48.459	2024-12-10 10:47:48.459	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
f5830687-f1cc-44a1-9319-ec81ec68c41c	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 10:49:07.207	2024-12-10 10:49:07.207	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
bca8fe9b-431f-46f5-bd4f-2e3a86f0576d	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 10:49:07.212	2024-12-10 10:49:07.212	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
72977bcb-df5d-492e-95f5-13c2618192e8	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 10:55:22.528	2024-12-10 10:55:22.528	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
baef89bc-82f6-4541-b73b-2c43e82ec13e	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 10:55:22.542	2024-12-10 10:55:22.542	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
41775f13-9007-4636-81ab-a2ec2c2355b5	Portugal	Portugal	f	2024-12-10 13:28:49.816	2024-12-10 13:28:49.816	\N	\N
f1e53357-2fb9-4cfa-b9dc-9e5180fad3ed	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 10:55:24.87	2024-12-10 10:55:24.87	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
5ba90cb2-5dfe-4885-b99b-20f2ee0a0c51	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 10:55:24.875	2024-12-10 10:55:24.875	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b60cd643-deae-4b40-8fdb-d728b1dd5d47	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 10:59:49.466	2024-12-10 10:59:49.466	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b73bc2bb-5e73-4f44-a3c3-a85d3d995d14	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 10:59:49.47	2024-12-10 10:59:49.47	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
accddc89-3c94-423f-9080-9576f64c1902	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:00:30.47	2024-12-10 11:00:30.47	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
15c88ad7-2912-4401-ba68-043aba3334db	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:00:30.48	2024-12-10 11:00:30.48	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
e3a3cc5e-fdef-489d-bfb6-f6721d248b07	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:01:33.135	2024-12-10 11:01:33.135	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
7548bd10-9b6e-465e-bb93-916d394bcb5d	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:01:33.153	2024-12-10 11:01:33.153	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
0a267c90-1e4b-4335-abbb-fe1137f3e579	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:04:18.458	2024-12-10 11:04:18.458	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a9fe5fe3-83e1-487c-ac13-51f47216635e	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:04:18.462	2024-12-10 11:04:18.462	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
88b33de6-f4c0-4af0-836f-06f4bc4cbb30	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:04:20.841	2024-12-10 11:04:20.841	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
f878c113-e754-4b9c-a37a-2788200fe677	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:04:20.848	2024-12-10 11:04:20.848	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
f7d06672-fd66-466d-97b5-d8a7cedb2f32	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:05:06.713	2024-12-10 11:05:06.713	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
05618962-d5b5-4710-abc8-f44385fed90b	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:05:06.72	2024-12-10 11:05:06.72	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
43e3af23-1e8e-4f94-9678-1eafee590458	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:16:54.994	2024-12-10 11:16:54.994	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
097b45d7-41ea-4b06-86b2-bf5410fb3459	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:16:55.007	2024-12-10 11:16:55.007	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ae78fe55-94ff-4808-a42e-8f7c4dfa7c87	Luxury Apartments in US	Appartements de Luxe à US	f	2024-12-10 11:19:29.1	2024-12-10 11:19:29.1	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b1f039df-bcb9-496b-b843-18e6f7224595	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 11:19:29.107	2024-12-10 11:19:29.107	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
462743be-a868-4f76-8497-455847c0d41c	Playground	Aire de jeux	f	2024-12-10 11:23:38.077	2024-12-10 11:23:38.077	39e7570b-405f-46c8-89a8-55505c695c5c	\N
c3e1f769-5265-4c61-85f1-f67e53b82d19	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:12:59.27	2024-12-10 18:12:59.27	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
db84079a-e4cd-4ead-abfe-b1d3d10e64ac	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 18:12:59.288	2024-12-10 18:12:59.288	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
86a0b603-2980-4888-b601-8631fe044934	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:14:29.776	2024-12-10 18:14:29.776	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d24981d8-8ac1-4223-90f4-fdc5a0eb2e3d	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 18:14:29.783	2024-12-10 18:14:29.783	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
49a61c0f-a6bc-4757-ae35-1a667e19b1df	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:14:33.669	2024-12-10 18:14:33.669	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a7ac99a7-b7a0-4be4-aea9-630ef762c6ab	A beautiful luxury apartment located in the heart of the city.	Un bel appartement de luxe situé au cœur de la ville.	f	2024-12-10 18:14:33.675	2024-12-10 18:14:33.675	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
8bc60c11-285a-4c77-ae87-0bd66ef0e5c8	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:15:36.644	2024-12-10 18:15:36.644	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
5f33edb7-4295-46dc-87cc-0d6513d0686d	A beautiful luxury	Un bel appartement	f	2024-12-10 18:15:36.649	2024-12-10 18:15:36.649	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
8b145933-6ffa-4aaa-99f5-4c324fc1b701	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:22:55.579	2024-12-10 18:22:55.579	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
7e2c7225-a8b4-4b06-b8ca-ba3925fb6c00	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:22:55.585	2024-12-10 18:22:55.585	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
5299f4af-3900-4b36-a4e1-86b24262bda1	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:30:46.501	2024-12-10 18:30:46.501	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
01f7794c-1253-481a-80bc-1a9ecee2ba41	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:30:46.509	2024-12-10 18:30:46.509	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d39cc56d-ba7b-4392-ab86-d254a88771c5	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:32:49.037	2024-12-10 18:32:49.037	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a237152d-8a4a-4105-aa3c-839f8ee9910d	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:32:49.045	2024-12-10 18:32:49.045	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
70957dc9-6a83-4c96-ac8e-5dc49189c71d	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:35:04.477	2024-12-10 18:35:04.477	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
336758e4-04ab-4a14-92f0-027bd05b41b2	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:35:04.483	2024-12-10 18:35:04.483	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
2215194c-cea0-43bb-86c3-cfbb18564295	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:35:16.532	2024-12-10 18:35:16.532	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
067e9cbb-7c26-482d-ad63-b576616ac184	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:35:16.535	2024-12-10 18:35:16.535	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
53f4fe55-6bae-461f-867d-c9e584361eba	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:38:39.726	2024-12-10 18:38:39.726	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a586c056-a6d1-4de2-80f8-8d322486ade3	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:38:39.732	2024-12-10 18:38:39.732	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
53053c1b-7723-45f5-9a3e-3cf109e441e9	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:38:42.231	2024-12-10 18:38:42.231	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
49f2d0f0-b657-4f46-aa7e-e2fd9cc97c3f	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:38:42.235	2024-12-10 18:38:42.235	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
e21144d4-bcc9-44dc-8826-9900c657cc20	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:38:44.025	2024-12-10 18:38:44.025	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
04e3a4de-a7ac-431f-be9a-1897e547e8c2	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:38:44.029	2024-12-10 18:38:44.029	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d0007846-42a5-47d1-8d64-2c80b5027b72	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:39:51.735	2024-12-10 18:39:51.735	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ace751c2-2661-4b9e-a43d-b1d3c45bb389	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:39:51.741	2024-12-10 18:39:51.741	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
9589d070-ac00-469c-bb8b-c7647e44205c	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:40:38.128	2024-12-10 18:40:38.128	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
6727d028-4f61-4760-b6cf-096958fdaaef	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:40:38.142	2024-12-10 18:40:38.142	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
aa1e02a2-5093-43af-98fb-16acfbd5a9cc	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:40:41.054	2024-12-10 18:40:41.054	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
37925611-7fb9-4ddd-96b5-9ed61a31dc3d	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:40:41.058	2024-12-10 18:40:41.058	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
f041c766-0b51-4fe4-9048-a9e179fd1086	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:44:40.71	2024-12-10 18:44:40.71	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
30b4027b-b9f3-498a-8b05-274a31a3e861	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:44:40.717	2024-12-10 18:44:40.717	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
1b8522ef-e2d3-41a7-bd87-8d5610985301	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:46:00.432	2024-12-10 18:46:00.432	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a568f6a1-7d51-46d3-9d1b-371f1a7f51dc	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:46:00.44	2024-12-10 18:46:00.44	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
c657d573-65e6-4b78-b323-a96eb8bc9354	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:46:21.603	2024-12-10 18:46:21.603	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
023144bf-1710-4221-87cc-6996819f28c7	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:46:21.61	2024-12-10 18:46:21.61	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
73f73d6b-6ccc-442b-959f-736aa22f8802	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:49:22.345	2024-12-10 18:49:22.345	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
dfea7a2f-b567-4a03-add2-3609f857ebe5	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:49:22.352	2024-12-10 18:49:22.352	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
e525eba9-2a46-44ce-9f6f-840c5ad45cda	Luxury in New York	Appartements New York	f	2024-12-24 09:22:25.259	2024-12-24 09:22:25.259	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1a76a97a-60b6-4dd6-b556-8e6d10e657e1	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:49:24.515	2024-12-10 18:49:24.515	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
4e396797-cbfa-414c-b15e-07f34a2279a4	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:49:24.521	2024-12-10 18:49:24.521	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
35790121-dfe2-4ded-b658-2f12b4bc50f6	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:54:51.105	2024-12-10 18:54:51.105	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
78c9c595-2e8d-403f-9dc8-a6c34c9c383f	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:54:51.111	2024-12-10 18:54:51.111	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
853baf52-84aa-4d7c-bb67-1438f2b232b3	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:56:43.19	2024-12-10 18:56:43.19	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
635a93e8-720d-42ae-8c4c-402bf05b5cde	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:56:43.201	2024-12-10 18:56:43.201	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
9311f1c1-7d69-4c6f-9e86-1863990f8752	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 18:58:12.742	2024-12-10 18:58:12.742	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
0367265f-63ce-4a34-aabf-a513d22fedbc	A beautiful luxury 	Un bel appartement	f	2024-12-10 18:58:12.749	2024-12-10 18:58:12.749	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
32c834a3-8f9c-4184-919d-5bc5a43213ab	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:01:23.903	2024-12-10 19:01:23.903	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
cff5ab11-a8db-45a9-a7a1-5565c55cbc47	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:01:23.91	2024-12-10 19:01:23.91	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
5e0693a1-425e-4948-829f-4893ef4665a6	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:03:35.534	2024-12-10 19:03:35.534	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
422e5d6c-c4c1-4b39-9868-c94691184757	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:03:35.54	2024-12-10 19:03:35.54	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
dac65acc-26d1-438d-b4af-c4865eb39790	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:03:37.82	2024-12-10 19:03:37.82	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
216425f5-d181-4e1d-bf01-59184e246f10	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:03:37.826	2024-12-10 19:03:37.826	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a07ff6e3-1bcf-457e-83f1-265e94dd6ff2	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:04:13.351	2024-12-10 19:04:13.351	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a3986027-d5e7-46e3-af85-2945490e7c31	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:04:13.358	2024-12-10 19:04:13.358	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
c3dd1952-d3db-407b-b22c-988188231092	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:04:54.13	2024-12-10 19:04:54.13	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
48785c40-dae3-4405-ba78-c23d60d73065	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:04:54.136	2024-12-10 19:04:54.136	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
f24cf613-2b83-41e4-8d9a-606f027333da	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:06:22.107	2024-12-10 19:06:22.107	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
1def81ce-d414-4e04-9406-bd10205e84ae	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:06:22.114	2024-12-10 19:06:22.114	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
073eb57b-6c9f-48bf-9c3d-b00546029d69	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:06:24.559	2024-12-10 19:06:24.559	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
88b7aa1a-e64d-4d30-ba0f-f4a7e2421723	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:06:24.566	2024-12-10 19:06:24.566	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
044442af-30b5-472d-9970-94761d6722c1	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:09:27.061	2024-12-10 19:09:27.061	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
f8149ae8-86bd-4d47-b0d1-c0a53727f119	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:09:27.065	2024-12-10 19:09:27.065	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
20d53684-a85f-4b2b-a481-d1b69b4e50d0	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:10:02.979	2024-12-10 19:10:02.979	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
443e44ac-9c79-4e89-819c-336bfa8c4c2d	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:10:02.996	2024-12-10 19:10:02.996	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
48595ed3-33c0-492d-9ed7-68af3d04d9f8	Luxury Apartments in New York	Appartements de Luxe à New York	f	2024-12-10 19:11:26.979	2024-12-10 19:11:26.979	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
5e4eb41d-54f6-4dbe-a970-cf8b8f1d6735	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:11:26.986	2024-12-10 19:11:26.986	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b47feec8-038f-487b-8a5c-d37a2e37392f	Modern Apartment	Appartement Moderne	f	2024-12-10 19:15:38.049	2024-12-10 19:15:38.049	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
299d9203-d895-414e-ac1d-c1eed7187bf3	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-10 19:15:38.058	2024-12-10 19:15:38.058	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
86496654-c598-4358-b99c-2eaa33e39fae	Luxury Apartments in Uk	Appartements de Luxe à Uk	f	2024-12-10 19:57:12.474	2024-12-10 19:57:12.474	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d93789e6-00d0-4c70-be84-46cec04f7c93	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:57:12.485	2024-12-10 19:57:12.485	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
6d6b1513-8303-4ab8-b079-e85e9fe0791f	Luxury Apartments in Uk	Appartements de Luxe à Uk	f	2024-12-10 19:57:37.8	2024-12-10 19:57:37.8	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b1bc7473-af26-45fb-80ce-0125bd64ddb4	A beautiful luxury 	Un bel appartement	f	2024-12-10 19:57:37.806	2024-12-10 19:57:37.806	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ddcf9850-e26d-48d9-8eb2-104ecdc9fc25	Luxury in New York	Appartements New York	f	2024-12-12 06:07:43.804	2024-12-12 06:07:43.804	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c41ca391-bab8-41a5-a309-507e93b08a46	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-12 06:07:43.807	2024-12-12 06:07:43.807	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
443c96e2-d680-4af9-92e1-7cd2c466421c	Luxury New York	 New York	f	2024-12-12 09:06:32.617	2024-12-12 09:06:32.617	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a7cd8f62-0148-492d-9ea9-16115ad6f249	A beautiful  located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-12 09:06:32.624	2024-12-12 09:06:32.624	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
b5a926e3-58bd-496d-ada7-5a76d60aceb8	Luxury New York	 New York	f	2024-12-12 09:06:49.632	2024-12-12 09:06:49.632	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e0dc747e-6e3e-4754-a042-262a63cdb171	A beautiful  located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-12 09:06:49.637	2024-12-12 09:06:49.637	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
cb8cbe36-4470-4627-8293-0b0337df9070	Luxury New York	 New York	f	2024-12-12 09:06:57.812	2024-12-12 09:06:57.812	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1c07855c-1602-4117-a63e-7c48a6a31f03	A beautiful  located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-12 09:06:57.815	2024-12-12 09:06:57.815	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
95b10bcc-1f62-4308-a949-1cc2dafe3bc6	Luxury New York	New York	f	2024-12-12 09:07:10.634	2024-12-12 09:07:10.634	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1f111c18-5c2b-4205-9e6a-44b1a9615dd0	A beautiful  located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-12 09:07:10.637	2024-12-12 09:07:10.637	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8cc84fb6-041b-42cd-987c-07cae77cf707	Cczz	Cczz	f	2024-12-12 09:14:53.891	2024-12-12 09:14:53.891	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
77dc9059-344b-40a5-98d6-33ab322ed723	Gwusjzhzjzjzkskansbshhshshzbzhzjzjzjz	Gwusjzhzjzjzkskansbshhshshzbzhzjzjzjz	f	2024-12-12 09:14:53.896	2024-12-12 09:14:53.896	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
7434f637-fd64-47e9-92a6-d5e792c20bf4	Cczz	Cczz	f	2024-12-12 09:15:28.714	2024-12-12 09:15:28.714	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2fc4835b-a13e-4516-a375-4d6a1f27a70f	Gwusjzhzjzjzkskansbshhshshzbzhzjzjzjz	Gwusjzhzjzjzkskansbshhshshzbzhzjzjzjz	f	2024-12-12 09:15:28.719	2024-12-12 09:15:28.719	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f91bb6fe-d678-476e-9659-b71333a9d34c	asdfasdf	asdfasdf	f	2024-12-12 09:16:12.835	2024-12-12 09:16:12.835	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8d172d87-3752-4219-b0ee-9c03dfce98ca	Adsfasdfasdf 	Adsfasdfasdf 	f	2024-12-12 09:16:12.848	2024-12-12 09:16:12.848	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4f05bc54-9b28-4e37-ab77-91589b45f396	Y4v eby4gb4g4by 4yb4	Y4v eby4gb4g4by 4yb4	f	2024-12-12 09:18:08.593	2024-12-12 09:18:08.593	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
61b62b7f-133c-490e-9dfd-9082e81083ac	Xcfffffrr	Xcfffffrr	f	2024-12-12 09:18:08.599	2024-12-12 09:18:08.599	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ac306148-ab28-4d51-badb-88db4868571f	large gardesn	grands jardin	f	2024-12-13 07:45:47.684	2024-12-13 07:45:47.684	\N	\N
b6e55f35-a886-46f4-b304-8e90aa7f283e	Hdhhd qwe	Hdhhd qwe	f	2024-12-13 09:21:36.421	2024-12-13 09:21:36.421	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e1f2490c-bb39-4d2f-b33c-28031a7d5813	Descriptions here	Descriptions here	f	2024-12-13 09:21:36.427	2024-12-13 09:21:36.427	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
09f11c05-390a-45bb-a3c0-d9dc48ab8519	titleController.text	titleController.text	f	2024-12-13 11:02:48.127	2024-12-13 11:02:48.127	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e1d67277-e225-446c-bff7-1e2fcfefb5ac	Tggg	Tggg	f	2024-12-13 11:02:48.132	2024-12-13 11:02:48.132	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c10d0fd2-007b-487e-a6a3-1e0bae93b766	titleController.text	titleController.text	f	2024-12-13 11:05:14.648	2024-12-13 11:05:14.648	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
bf8572db-3d00-4354-9968-8fac73993694	Tggg	Tggg	f	2024-12-13 11:05:14.66	2024-12-13 11:05:14.66	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a2544188-10b3-45c8-b912-546fc0b7a80d	Dd	Dd	f	2024-12-13 11:17:27.522	2024-12-13 11:17:27.522	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ef8e11de-8f42-4d85-b2e1-b7f12aa70592	Ddd	Ddd	f	2024-12-13 11:17:27.528	2024-12-13 11:17:27.528	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8757a7a7-e138-4783-9fbb-9f1faaedf9af	Dd	Dd	f	2024-12-13 11:18:22.46	2024-12-13 11:18:22.46	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
b17c9adc-e15b-4a61-b353-1e9090c9905f	Ddd	Ddd	f	2024-12-13 11:18:22.47	2024-12-13 11:18:22.47	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
49e4840e-b841-4151-b3b9-4ae7ff2555c1	Dd	Dd	f	2024-12-13 11:21:28.443	2024-12-13 11:21:28.443	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
b536e2bd-ae27-4ac2-aef2-3da039c234a0	Ddd	Ddd	f	2024-12-13 11:21:28.447	2024-12-13 11:21:28.447	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
864829cc-773a-4927-af5f-30d7b9d38534	Dd	Dd	f	2024-12-13 11:22:51.545	2024-12-13 11:22:51.545	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
fbdaaff4-61b3-46b3-9bc0-690c586a461f	Ddd	Ddd	f	2024-12-13 11:22:51.555	2024-12-13 11:22:51.555	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
5376366d-c834-49b9-8c1e-60c9e795c2c4	Dd	Dd	f	2024-12-13 11:24:58.935	2024-12-13 11:24:58.935	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
50730536-0775-40a5-a1fd-20a0ea9fb899	Ddd	Ddd	f	2024-12-13 11:24:58.942	2024-12-13 11:24:58.942	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
08c23c4e-dea6-44e5-9838-15461c47617e	Dd	Dd	f	2024-12-13 11:26:56.511	2024-12-13 11:26:56.511	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a26bc1ba-f259-4374-99cb-dff57997e71c	Ddd	Ddd	f	2024-12-13 11:26:56.516	2024-12-13 11:26:56.516	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
984b7514-b25d-421b-9904-8f7413a6d770	Dd	Dd	f	2024-12-13 11:30:29.398	2024-12-13 11:30:29.398	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
673fac8f-a895-4f32-8a17-7511f220e5de	Ddd	Ddd	f	2024-12-13 11:30:29.41	2024-12-13 11:30:29.41	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
171fd4a7-fa77-45e1-9846-c58b49981c35	Ddd	Ddd	f	2024-12-13 11:32:01.352	2024-12-13 11:32:01.352	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1a6650e3-db19-4df2-8b1d-5fd39676a058	Fff	Fff	f	2024-12-13 11:32:01.36	2024-12-13 11:32:01.36	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
18dd9ce3-c282-4898-97ea-5b9296291d23	Ddd	Ddd	f	2024-12-13 11:35:15.011	2024-12-13 11:35:15.011	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
48f0af09-1d1c-4150-acef-ee27afaa17da	Fff	Fff	f	2024-12-13 11:35:15.016	2024-12-13 11:35:15.016	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
cd5beb7f-aaf0-4396-b286-e7d2f0e91e8a	Ddd	Ddd	f	2024-12-13 11:36:00.772	2024-12-13 11:36:00.772	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f10399cb-3c65-4772-a61a-28a754ab1857	Fff	Fff	f	2024-12-13 11:36:00.776	2024-12-13 11:36:00.776	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4f95444c-0df7-4de4-be86-b44fb4f8e2c4	Dddgadfadsfd	asdfsadfasdf	f	2024-12-13 11:36:59.158	2024-12-13 11:36:59.158	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
80047004-5e1a-4f50-996f-52bc7616bff2	Fff	Fff	f	2024-12-13 11:36:59.164	2024-12-13 11:36:59.164	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2d30bfe9-66fd-47f2-ab5e-b9e15d8c1105	Ddd	Ddd	f	2024-12-13 11:37:34.72	2024-12-13 11:37:34.72	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
5f7ebe4b-f70e-4304-8cd4-7b08044b1136	Fff	Fff	f	2024-12-13 11:37:34.724	2024-12-13 11:37:34.724	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d2457bcb-0e86-4686-94b1-8c2d78d75190	Ddd asdfasdfsadfdf	Ddd	f	2024-12-13 11:39:11.385	2024-12-13 11:39:11.385	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
41fe8b60-80b7-41d8-a66e-5079c5cec252	Fff	Fff	f	2024-12-13 11:39:11.39	2024-12-13 11:39:11.39	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e210cf67-6ccd-4b26-9963-01402d6da965	Ddd 4563456	Ddd 132 5656666	f	2024-12-13 11:45:53.736	2024-12-13 11:45:53.736	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4f8898b6-151b-4ec2-b6b1-9db87b4a1ec3	Fff	Fff	f	2024-12-13 11:45:53.741	2024-12-13 11:45:53.741	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a0313003-6284-4888-8b5f-1d4db6ec7cef	Fff	Fff	f	2024-12-13 11:54:23.16	2024-12-13 11:54:23.16	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
82588fb1-b3cc-4519-831a-95aef8c6e314	Fffff	Fffff	f	2024-12-13 11:54:23.168	2024-12-13 11:54:23.168	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
731e4622-0675-4e3d-ad82-712760847cff	Fff	Fff	f	2024-12-13 12:00:02.122	2024-12-13 12:00:02.122	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ba2b095c-8d34-4164-89ce-900ebe09bb23	Fffff	Fffff	f	2024-12-13 12:00:02.166	2024-12-13 12:00:02.166	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6c17e86c-94f7-4072-ac85-5c9af34563ff	Fff	Fff	f	2024-12-13 12:00:30.405	2024-12-13 12:00:30.405	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
67402775-8c86-4651-ad01-ae422d2c5e06	Fffff	Fffff	f	2024-12-13 12:00:30.416	2024-12-13 12:00:30.416	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
71866fd3-ab5d-4f58-a272-65cbbdeb055b	Fff	Fff	f	2024-12-13 12:02:46.979	2024-12-13 12:02:46.979	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e1bf2e76-259e-4088-9e0f-7b9fb9f10c2e	Fffff	Fffff	f	2024-12-13 12:02:46.986	2024-12-13 12:02:46.986	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ee1f908e-f24e-4156-afbf-097023f8db6c	Fff	Fff	f	2024-12-13 12:03:17.041	2024-12-13 12:03:17.041	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2933f18c-1fa4-4c3c-a15c-3c464e7b3810	Fffff	Fffff	f	2024-12-13 12:03:17.045	2024-12-13 12:03:17.045	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
3141d209-604d-4c46-855a-e6c53c2b1ed9	Fh	Fh	f	2024-12-13 12:06:40.646	2024-12-13 12:06:40.646	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
06c8ccf6-c5ff-445a-b85e-9b438b99091b	Fffgh	Fffgh	f	2024-12-13 12:06:40.651	2024-12-13 12:06:40.651	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a10beffc-6f03-4b97-9730-04ec08a76c02	Fh	Fh	f	2024-12-13 12:09:14.915	2024-12-13 12:09:14.915	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
db2d8037-600b-4f78-a44f-c5282658b94f	Fffgh	Fffgh	f	2024-12-13 12:09:14.92	2024-12-13 12:09:14.92	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f0aad345-e1b0-468f-8eff-821e68b2463c	Fh	Fh	f	2024-12-13 12:09:57.632	2024-12-13 12:09:57.632	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
aeca9519-793a-43bc-b345-32bb11ef1fc8	Fffgh	Fffgh	f	2024-12-13 12:09:57.636	2024-12-13 12:09:57.636	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
7f4efdd6-6c5d-48a8-bc59-1c5eb6a12ef1	Fh	Fh	f	2024-12-13 12:10:58.071	2024-12-13 12:10:58.071	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
bc491222-11a6-4081-bdf3-e5e7b81453f7	Fffgh	Fffgh	f	2024-12-13 12:10:58.077	2024-12-13 12:10:58.077	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2f9553ca-cea9-4f47-bb59-0777e4f34740	Fh	Fh	f	2024-12-13 12:11:28.681	2024-12-13 12:11:28.681	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
b5426430-7060-4ec3-84f6-d1f2a56cf05f	Fffgh	Fffgh	f	2024-12-13 12:11:28.685	2024-12-13 12:11:28.685	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
781a1f7d-1acb-4a14-8349-38a287df08e8	Fhffff	Fhffff	f	2024-12-13 12:12:18.379	2024-12-13 12:12:18.379	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e061bed5-c4cb-4ffc-83fa-eb4d0a8eeb47	Fffghddd	Fffghddd	f	2024-12-13 12:12:18.386	2024-12-13 12:12:18.386	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
656c5e52-cc1e-4d92-85c4-1cc7843c2ec8	Okmbc	Okmbc	f	2024-12-13 12:13:57.778	2024-12-13 12:13:57.778	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
97ac0bba-01e1-4012-8e93-adff31762810	Ccgg	Ccgg	f	2024-12-13 12:13:57.782	2024-12-13 12:13:57.782	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
e2e6163f-3839-4085-86a9-9f4bd73aa9fe	Fdcbf	Fdcbf	f	2024-12-13 12:16:50.45	2024-12-13 12:16:50.45	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1bf9ac69-45a4-4423-bf50-f1cbcfbb160e	Xxszzhk	Xxszzhk	f	2024-12-13 12:16:50.455	2024-12-13 12:16:50.455	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
78f6e5d0-1cfe-491e-a1b5-1c9f80a99653	Fdcbfvvv	Fdcbfvvv	f	2024-12-13 12:18:52.356	2024-12-13 12:18:52.356	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
cf4abbb6-7c43-43db-b362-210f376f3c10	Xxszzhk	Xxszzhk	f	2024-12-13 12:18:52.363	2024-12-13 12:18:52.363	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
296a803c-7670-44e6-87b8-82587ff6da67	Fdcbfvvv	Fdcbfvvv	f	2024-12-13 12:19:30.086	2024-12-13 12:19:30.086	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
7dce9323-dcbc-4db6-8e78-183d5ceef771	Xxszzhk	Xxszzhk	f	2024-12-13 12:19:30.091	2024-12-13 12:19:30.091	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
19fb2928-eb1c-45a3-a1a3-66e866ab3478	Fdcbfvvv	Fdcbfvvv	f	2024-12-13 12:19:55.231	2024-12-13 12:19:55.231	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ae7f0693-b1a4-4cc9-acb1-0b3dbbabfbe2	Xxszzhk	Xxszzhk	f	2024-12-13 12:19:55.236	2024-12-13 12:19:55.236	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4bb892ad-da66-4cec-83af-4c2132e44039	Hhkookn	Hhkookn	f	2024-12-13 12:22:36.869	2024-12-13 12:22:36.869	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ba810776-12d9-4cc2-ae9a-b70e111ed380	Rert6	Rert6	f	2024-12-13 12:22:36.875	2024-12-13 12:22:36.875	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
344de9e4-ab77-461a-9fb3-6a89e1b380c2	Hhkookn	Hhkookn	f	2024-12-13 12:25:40.873	2024-12-13 12:25:40.873	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ddd3c147-a6fb-4592-b88d-2c02312f5773	Rert6	Rert6	f	2024-12-13 12:25:40.878	2024-12-13 12:25:40.878	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
dff5a7fd-821a-4a44-8350-63c007e1409f	Tbebgnkjf	Tbebgnkjf	f	2024-12-13 12:28:32.051	2024-12-13 12:28:32.051	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f125b51f-2359-448f-8f33-c79c5da4fbcf	Ddctbumcsx	Ddctbumcsx	f	2024-12-13 12:28:32.061	2024-12-13 12:28:32.061	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a78365a3-3cbb-4f1f-b332-614c0372e646	Tbebgnkjf	Tbebgnkjf	f	2024-12-13 12:32:16.727	2024-12-13 12:32:16.727	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
49d3673a-8051-48ce-8ec7-94d1cdc83db3	Ddctbumcsx	Ddctbumcsx	f	2024-12-13 12:32:16.733	2024-12-13 12:32:16.733	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6211fc69-db43-40dd-a9ee-c19d181392e3	Yueurjr	Yueurjr	f	2024-12-13 12:33:24.79	2024-12-13 12:33:24.79	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
37723d33-b08e-4d9e-8cad-e17ec1da7268	Gebbeb	Gebbeb	f	2024-12-13 12:33:24.795	2024-12-13 12:33:24.795	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
363de969-16c2-4efc-877f-1fe29cabc3a2	Yueurjr	Yueurjr	f	2024-12-13 12:33:49.335	2024-12-13 12:33:49.335	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4e55684f-a741-4562-87cd-bc847c43a253	Gebbeb	Gebbeb	f	2024-12-13 12:33:49.339	2024-12-13 12:33:49.339	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
7d44df1f-da89-4b67-a48e-79e72000922d	Uure	Uure	f	2024-12-13 12:51:31.12	2024-12-13 12:51:31.12	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
728623e7-6986-4b0b-8d7a-92ab941569f4	Ngedf	Ngedf	f	2024-12-13 12:51:31.126	2024-12-13 12:51:31.126	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d43babbf-cf63-4707-8f97-eec111971c25	Ijjgfx	Ijjgfx	f	2024-12-13 12:54:17.376	2024-12-13 12:54:17.376	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
9e58154b-4d8c-4822-9425-b4f632aa37a6	D wvu urgent eef vrw	D wvu urgent eef vrw	f	2024-12-13 12:54:17.385	2024-12-13 12:54:17.385	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
734dad8e-da2a-4858-85a7-d3450e151592	Ijjgfx	Ijjgfx	f	2024-12-13 12:55:58.346	2024-12-13 12:55:58.346	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c0292180-556e-4d2c-964d-72323a3cd0a6	D wvu urgent eef vrw	D wvu urgent eef vrw	f	2024-12-13 12:55:58.357	2024-12-13 12:55:58.357	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a27dd97a-e4f9-42dd-953a-2a71bec6e4b5	 Great fe f rfr 	 Great fe f rfr 	f	2024-12-13 13:26:52.289	2024-12-13 13:26:52.289	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c524d824-44c1-4fa9-9d8e-8fc1a5d6dd61	Vfqf weft e f	Vfqf weft e f	f	2024-12-13 13:26:52.295	2024-12-13 13:26:52.295	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
041ca5a1-4d37-4445-a7bd-d6646f513e20	asdfasdf	asdfasdf	f	2024-12-14 06:36:11.049	2024-12-14 06:36:11.049	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6cd10f90-ee74-4b5e-a73a-83e2d38b5945	dsfgsdfgsdfg	dsfgsdfgsdfg	f	2024-12-14 06:36:11.057	2024-12-14 06:36:11.057	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
0648a2e6-e844-4bd6-99f3-d1f9588616c5	asdasDad	asdasDad	f	2024-12-14 06:40:30.941	2024-12-14 06:40:30.941	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2c83f24f-1def-4517-a479-d79cca1ae121	asdfasdfasdf	asdfasdfasdf	f	2024-12-14 06:40:30.949	2024-12-14 06:40:30.949	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
628cd5a9-1d8e-4612-9775-9b88cbbb2c43	asDasd	asDasd	f	2024-12-14 06:42:34.916	2024-12-14 06:42:34.916	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4e8b6fc7-2dde-4a6f-bef5-650047a930f2	xczvssdf	xczvssdf	f	2024-12-14 06:42:34.921	2024-12-14 06:42:34.921	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
56639244-e5c0-4643-92f1-fa8c402cdda6	assdafasdf	assdafasdf	f	2024-12-14 06:47:47.984	2024-12-14 06:47:47.984	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
43159740-44d5-48f3-ac45-9b463f3a865f	asdasdasd	asdasdasd	f	2024-12-14 06:47:47.989	2024-12-14 06:47:47.989	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
46b8099b-3229-4754-bbbb-fadc39b9b3a4	Hello 	Hello 	f	2024-12-16 05:32:30.272	2024-12-16 05:32:30.272	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c3c54c86-7e2c-4a86-9846-e9f6ddc2f8c8	Xjxjxjxjx	Xjxjxjxjx	f	2024-12-16 05:32:30.279	2024-12-16 05:32:30.279	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6ed3032d-172d-4b4e-b824-079d25bc78f4	Hello 	Hello 	f	2024-12-16 05:33:30.555	2024-12-16 05:33:30.555	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8eb1cb71-3f15-4fb5-aa95-09427e072b5d	 6susuxx	 6susuxx	f	2024-12-16 05:33:30.558	2024-12-16 05:33:30.558	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c663b23c-b9a3-46eb-b5ba-e1768ad32e57	Rhqdhdqgddhwfh	Rhqdhdqgddhwfh	f	2024-12-16 07:49:50.561	2024-12-16 07:49:50.561	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a5427704-afcc-4d44-922f-e48dc5043b04	Rcce	Rcce	f	2024-12-16 07:49:50.568	2024-12-16 07:49:50.568	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
87ef81ef-0ba4-4b97-843e-0185ef27f503	Testing Project	Projet de test	f	2024-12-16 08:16:57.747	2024-12-16 08:16:57.747	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
5ec8e112-6813-4204-80ee-f509c9c5317b	Testing Project Testing Project	Projet de test Projet de test Projet de test Projet de test	f	2024-12-16 08:16:57.76	2024-12-16 08:16:57.76	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
edd030cb-ee6f-48b4-9311-7c91b043db31	swati group	swati group	f	2024-12-16 08:21:28.228	2024-12-16 08:21:28.228	0c03e72a-1d70-4e00-8c39-23f0ae96f6a5	\N
b51a28f6-36dc-45bf-bd52-f89cf8c80473	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.	f	2024-12-16 08:21:28.235	2024-12-16 08:21:28.235	0c03e72a-1d70-4e00-8c39-23f0ae96f6a5	\N
50102fb8-c44a-4cf2-92db-898b4a26ab6b	New Developer Project	New Developer Project	f	2024-12-16 11:06:46.503	2024-12-16 11:06:46.503	31950c69-b8bb-4de8-bfb3-05c1a20fcf1a	\N
3554cc52-a166-4c22-8abf-f4d5d0204e27	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.	f	2024-12-16 11:06:46.521	2024-12-16 11:06:46.521	31950c69-b8bb-4de8-bfb3-05c1a20fcf1a	\N
4bb26562-b158-4252-a2ca-ba3d868ff1ab	Property English	Propriété Anglais	f	2024-12-16 11:13:43.889	2024-12-16 11:13:43.889	31950c69-b8bb-4de8-bfb3-05c1a20fcf1a	\N
874fcade-d4a9-465d-bddf-c34521905a61	Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. \n\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.	Lorem Ipsum est tout simplement un faux texte de l’industrie de l’imprimerie et de la composition. Lorem Ipsum est le texte factice standard de l'industrie depuis les années 1500, lorsqu'un imprimeur inconnu a pris une galerie de caractères et l'a brouillée pour en faire un livre de spécimens de caractères. Il a survécu non seulement à cinq siècles, mais aussi au saut vers la composition électronique, restant essentiellement inchangé. \n\nIl a été popularisé dans les années 1960 avec la sortie de feuilles Letraset contenant des passages de Lorem Ipsum, et plus récemment avec des logiciels de publication assistée par ordinateur comme Aldus PageMaker comprenant des versions de Lorem Ipsum.	f	2024-12-16 11:13:43.9	2024-12-16 11:13:43.9	31950c69-b8bb-4de8-bfb3-05c1a20fcf1a	\N
69d6d5c0-105e-456c-bd28-fac3ee03614b	Modern Apartment	Appartement Moderne	f	2024-12-16 11:53:38.691	2024-12-16 11:53:38.691	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d46b42fc-6828-4d3d-8a2f-d0cb89e4b8f9	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 11:53:38.697	2024-12-16 11:53:38.697	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
bdcf0ea0-a744-4b15-b055-1bdd78d4e0f1	Modern Apartment	Appartement Moderne	f	2024-12-16 11:53:57.302	2024-12-16 11:53:57.302	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
2bcae1db-1aab-4330-a221-8a2eb3d9fb2b	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 11:53:57.312	2024-12-16 11:53:57.312	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
8b20cec3-9588-4eaa-ae6f-8964aba7880f	Modern Apartment	Appartement Moderne	f	2024-12-16 11:55:26.528	2024-12-16 11:55:26.528	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
8868f4b7-7935-490a-b8b1-09b0d3279fe1	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 11:55:26.535	2024-12-16 11:55:26.535	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
86fadd35-db0e-494b-a92d-965d720a7ffa	Modern Apargggggggggtment	Appartement Modsfdgrgdfgerne	f	2024-12-16 11:55:51.181	2024-12-16 11:55:51.181	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
fd276790-e653-4129-88e4-e6dd71539862	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 11:55:51.189	2024-12-16 11:55:51.189	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
6539d5f7-7f3f-4957-9ae9-6319458613bc	Modern Apargggggggggtment	Appartement Modsfdgrgdfgerne	f	2024-12-16 11:55:59.337	2024-12-16 11:55:59.337	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
df15b6b5-1691-4f1d-8607-7d58f6fe7989	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 11:55:59.341	2024-12-16 11:55:59.341	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
bafeec0a-9095-460c-b0ca-e1ea79981927	Argument 	Argument 	f	2024-12-16 13:00:56.039	2024-12-16 13:00:56.039	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4fddf653-cf74-4c4c-9b5a-7ebeb5fb6fb2	Description namaste I will attract and peaceful , but I don't want you are capable to conquer namaste I will attract and peaceful and peaceful , but I don't want 	Description namaste I will attract and peaceful , but I don't want you are capable to conquer namaste I will attract and peaceful and peaceful , but I don't want 	f	2024-12-16 13:00:56.057	2024-12-16 13:00:56.057	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
9647e3bd-fc06-4e0f-97f0-52621195337b	Modern Apartment	Appartement Moderne	f	2024-12-16 13:02:23.903	2024-12-16 13:02:23.903	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
33c878c1-251a-4bca-b804-8bf95570cd60	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 13:02:23.907	2024-12-16 13:02:23.907	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d33a8e74-371b-4028-b34b-043f4667e9c4	New property add	New property add	f	2024-12-16 13:12:22.067	2024-12-16 13:12:22.067	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
25fdb660-45df-4757-89ae-070d16183b04	Description namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful 	Description namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful 	f	2024-12-16 13:12:22.083	2024-12-16 13:12:22.083	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6ee73a07-e87e-48e3-a780-bc980daa5801	New property add	New property add	f	2024-12-16 13:23:09.26	2024-12-16 13:23:09.26	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d86d2c17-1bf5-40ee-8954-12534a99ff00	Description of the following questions for you 	Description of the following questions for you 	f	2024-12-17 14:05:04.206	2024-12-17 14:05:04.206	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c41f047d-31e9-49b3-804f-6434d6568296	Rrrr	Rrrr	f	2024-12-17 19:07:35.842	2024-12-17 19:07:35.842	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8ccc7a55-8fea-4535-b7b1-b49038c7c67e	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 10:48:25.182	2024-12-19 10:48:25.182	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
eed82ecb-89e4-4f25-96c4-04f5c48ac730	Description namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and..	Description namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and..	f	2024-12-16 13:23:09.269	2024-12-16 13:23:09.269	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
77a30bf5-cac5-43af-af04-70ff43492fec	Stimulate 	Stimulate 	f	2024-12-16 13:27:51.705	2024-12-16 13:27:51.705	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
76e99b87-2785-4b84-b95f-0f53759ad7e7	Us time to conquer namaste I will attract and peaceful and peaceful and peaceful and peaceful and 	Us time to conquer namaste I will attract and peaceful and peaceful and peaceful and peaceful and 	f	2024-12-16 13:27:51.73	2024-12-16 13:27:51.73	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
071eca39-7b40-496d-9c9d-a23dffb8c8b2	Check 	Check 	f	2024-12-16 14:09:26.078	2024-12-16 14:09:26.078	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6d39405b-461b-4a12-aeaf-70288836683b	You a lot to be healthy work with you and work on the author namaste 6656	You a lot to be healthy work with you and work on the author namaste 6656	f	2024-12-16 14:09:26.089	2024-12-16 14:09:26.089	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
646da728-4f24-4acf-ba7f-b7bafe4bbeb3	Mrtment	t Moderne	f	2024-12-16 14:16:10.674	2024-12-16 14:16:10.674	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
1b312ff5-c244-412c-a806-0c3b3a5477a5	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 14:16:10.685	2024-12-16 14:16:10.685	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
d5cf6d30-7b03-490e-b4f9-2ffd5fcc4ebe	Appartement	Appartement 	f	2024-12-16 14:16:44.044	2024-12-16 14:16:44.044	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
7f7d39ad-8837-4393-a6ef-0a0ed774fc23	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 14:16:44.049	2024-12-16 14:16:44.049	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ee9862ef-1b9b-4ee0-895b-1becd74401d1	Appartement	Appartement 	f	2024-12-16 14:18:06.923	2024-12-16 14:18:06.923	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a302c5ae-9f0b-4639-a3f7-8dbafdf5af9b	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 14:18:06.929	2024-12-16 14:18:06.929	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b6994afa-6c92-4926-9c41-10d562f00491	dgggggg	Appartemefbbbnt 	f	2024-12-16 14:26:31.641	2024-12-16 14:26:31.641	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
245b4d41-806f-46b1-80cd-ab77b5ffbf64	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-16 14:26:31.648	2024-12-16 14:26:31.648	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
3c1aa43d-fa44-4e5e-acf3-eab98b24ba9a	Agency test	Agency test	f	2024-12-17 05:18:12.858	2024-12-17 05:18:12.858	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
08673325-2022-4493-8fc8-9cd307c0ea03	Htr	Htr	f	2024-12-17 05:18:12.864	2024-12-17 05:18:12.864	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
6dd123d2-751f-45f1-8c3f-77b21577a9b0	dgggggg	Appartemefbbbnt 	f	2024-12-17 05:28:05.435	2024-12-17 05:28:05.435	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
68d964ab-165e-4826-a09e-ad3393e6ae37	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-17 05:28:05.442	2024-12-17 05:28:05.442	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
13678994-d7b6-4d6d-abd7-d79307361333	Apartment	Appartement	f	2024-12-17 06:10:39.167	2024-12-17 06:10:39.167	\N	\N
19991945-127c-43aa-9aee-067c01ff4655	Apartment	Appartement	f	2024-12-17 06:11:36.914	2024-12-17 06:11:36.914	\N	\N
c45f4882-fee4-4c2e-8866-fc99c83c7249	large gardesn	grands jardin	f	2024-12-17 06:12:14.754	2024-12-17 06:12:14.754	\N	\N
33d6f0fe-86e3-4de1-aa0f-87bfa1255203	Luxury in New York	Appartements New York	f	2024-12-17 07:25:12.908	2024-12-17 07:25:12.908	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ae67da32-2d1d-4351-a894-4057821c3cac	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-17 07:25:12.921	2024-12-17 07:25:12.921	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
91b4c50c-02fd-476e-80fb-91c26acbadb2	Nubby	Nubby	f	2024-12-17 07:27:31.112	2024-12-17 07:27:31.112	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
865bf266-472e-4246-b067-3b1ce72b5f1b	5h5h5h5b5btb6mmj y TY namaste I will attract and peaceful and w I will attract and in life and 6	5h5h5h5b5btb6mmj y TY namaste I will attract and peaceful and w I will attract and in life and 6	f	2024-12-17 07:27:31.12	2024-12-17 07:27:31.12	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
cb12c26c-8300-4d91-8d0d-2c62c57ccba7	Nubfhbghfghhby	Nugfbfgbfbby	f	2024-12-17 07:30:47.21	2024-12-17 07:30:47.21	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
91b51f4a-e546-4b56-aeec-8af895bc61db	5h5h5h5b5btb6mmj y bfgbhfbhhTY namaste I will attract and peaceful and w I will attract and in life and 6	5h5h5h5b5btb6mmj y TY namaste I will attract and peaceful and w I will attract and in life and 6	f	2024-12-17 07:30:47.234	2024-12-17 07:30:47.234	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
89513eb0-ca10-4667-870e-1e7e9d7ff9ca	Jxjxuxx	Jxjxuxx	f	2024-12-17 08:01:26.887	2024-12-17 08:01:26.887	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
41391471-9534-4090-a74f-b1338b507648	luxury I will attract and peaceful and peaceful and peaceful and 	luxury I will attract and peaceful and peaceful and peaceful and 	f	2024-12-17 08:01:26.914	2024-12-17 08:01:26.914	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a2dbcaef-3e93-47d7-9211-3d6b90550cf8	Projects test	Projects test	f	2024-12-17 09:09:09.798	2024-12-17 09:09:09.798	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
96b6a945-69cb-4b29-8e55-8bf6a2a70b1e	Description namaste I will attract and and and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and 	Description namaste I will attract and and and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and 	f	2024-12-17 09:09:09.808	2024-12-17 09:09:09.808	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d79d5ff8-2f23-4bdc-9a8b-b585a690a6ff	Property test	Property test	f	2024-12-17 09:24:16.637	2024-12-17 09:24:16.637	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6b6ac627-af39-4c31-94c8-7da7fd9f8272	Description namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and 	Description namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and 	f	2024-12-17 09:24:16.646	2024-12-17 09:24:16.646	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
fe152994-ada4-49a5-87a8-f93aa9270a2e	Hshshs	Hshshs	f	2024-12-17 09:32:21.92	2024-12-17 09:32:21.92	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
394da6c3-8139-451c-9d47-922f3795f695	Yes yes I know you will get items in m I am a magnet namaste namaste I am a priority self namaste namaste 	Yes yes I know you will get items in m I am a magnet namaste namaste I am a priority self namaste namaste 	f	2024-12-17 09:32:21.935	2024-12-17 09:32:21.935	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
40e91f64-8227-4a58-ab9e-19a5b5e95b95	Dmzmxkx	Dmzmxkx	f	2024-12-17 09:35:49.113	2024-12-17 09:35:49.113	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f58e2867-127c-4b1d-94b4-20269c6bbe76	Xysysyss	Xysysyss	f	2024-12-17 09:35:49.12	2024-12-17 09:35:49.12	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
b634563f-13de-45f7-a544-c27608c15ba9	Dd6f6fffffff	Dd6f6fffffff	f	2024-12-17 09:36:50.661	2024-12-17 09:36:50.661	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
945933a2-f3a7-442d-864b-10193516c807	Fydyydyxxx	Fydyydyxxx	f	2024-12-17 09:36:50.666	2024-12-17 09:36:50.666	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
9294ec68-a28e-4605-8c5f-0e9dd7bf4a8b	SIGN APK	SIGN APK	f	2024-12-17 10:01:04.211	2024-12-17 10:01:04.211	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1060ba81-500e-4abd-95b7-8016bebdaa92	Vsvshshshhshs	Vsvshshshhshs	f	2024-12-17 10:01:04.222	2024-12-17 10:01:04.222	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4933c233-e786-4420-b819-54cf48a1962c	ffffff	45545	f	2024-12-17 12:32:18.147	2024-12-17 12:32:18.147	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
454d337d-3f14-4d6c-b93d-31dfffa385f8	45564	564	f	2024-12-17 12:32:18.185	2024-12-17 12:32:18.185	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
058c8126-0bdf-4dfd-81f1-d3412c0995f0	Third property 	Third property 	f	2024-12-17 13:09:35.836	2024-12-17 13:09:35.836	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
405f9983-ee0d-405c-86ae-b503691b5645	Here is description	Here is description	f	2024-12-17 13:09:35.842	2024-12-17 13:09:35.842	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
90b169e8-df54-4872-8e70-95ffd4d64b76	Hehdh	Hehdh	f	2024-12-17 13:57:03.952	2024-12-17 13:57:03.952	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c3b62adc-aad0-4456-a55a-9ddbaf36fd6d	Vtvhb	Vtvhb	f	2024-12-17 13:57:03.972	2024-12-17 13:57:03.972	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
955ca193-699c-46a4-a1c3-5897d0f9f341	Yhub	Yhub	f	2024-12-17 13:58:51.621	2024-12-17 13:58:51.621	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
872cac6c-314a-47c1-812f-332ad75c3cbe	Yvybyb	Yvybyb	f	2024-12-17 13:58:51.672	2024-12-17 13:58:51.672	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
7da5375f-0264-4a23-8f49-4a72f608cb31	Fttfy	Fttfy	f	2024-12-17 14:00:57.84	2024-12-17 14:00:57.84	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2eb630b1-673e-4df4-b39d-28595ae6aa09	Ct CT ct	Ct CT ct	f	2024-12-17 14:00:57.863	2024-12-17 14:00:57.863	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
32234c10-c9a2-4ab6-ab13-89cabadb03e2	F5gyhhu	F5gyhhu	f	2024-12-17 14:02:32.231	2024-12-17 14:02:32.231	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
9339aeec-38c1-43f6-b059-2feb24fe5116	Ghvhbjh	Ghvhbjh	f	2024-12-17 14:02:32.235	2024-12-17 14:02:32.235	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
9ab59897-5f5b-4382-b395-68dd90d28aaf	New project	New project	f	2024-12-17 14:05:04.196	2024-12-17 14:05:04.196	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f5bfc66f-7c60-44f1-b8da-0a7705876942	Fgggggggggddszghkoojfds	Fgggggggggddszghkoojfds	f	2024-12-17 19:07:35.873	2024-12-17 19:07:35.873	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
eee9ce69-6f9f-4d15-9384-8d31bdb7edd6	Locat5	Locat5	f	2024-12-18 09:25:13.952	2024-12-18 09:25:13.952	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
bbf55575-b563-4687-b2da-4e1fc61b9916	Dexter namaste namaste I am a magnet namaste namaste namaste I am a magnet for s namaste namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful namaste 	Dexter namaste namaste I am a magnet namaste namaste namaste I am a magnet for s namaste namaste I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful namaste 	f	2024-12-18 09:25:13.957	2024-12-18 09:25:13.957	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4ccb14d8-de97-46e6-aa54-4f3ea81fd359	Test Mamoune	Le test de Mamoune	f	2024-12-18 10:26:23.514	2024-12-18 10:26:23.514	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
a5c99221-2afe-4cb4-8755-0d1b9ed3cfd4	Wonderful sight in front of a big garden	Belle vue devant un beau jardin	f	2024-12-18 10:26:23.527	2024-12-18 10:26:23.527	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
44186f60-030a-48b2-a585-1796eb67ce7b	Hy ki	Hy ki	f	2024-12-18 10:33:27.16	2024-12-18 10:33:27.16	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6c924cbe-f649-4f2d-b878-e917580ef924	Gtg5h5f5hunyhyb	Gtg5h5f5hunyhyb	f	2024-12-18 10:33:27.169	2024-12-18 10:33:27.169	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8c41cdfa-4050-4903-a3b6-fa95982d4ac4	Big Agency	Grande agence	f	2024-12-18 13:29:06.998	2024-12-18 13:29:06.998	\N	\N
6c6fd3f6-fae3-47b7-8489-e4100fe5ffb0	Oualid test title english	OUALID TEST TITre francais	f	2024-12-18 14:39:18.986	2024-12-18 14:39:18.986	5a7e2d1c-6624-4ce0-933f-fa4cad35eb57	\N
4e658fee-d08e-4251-b6b3-4249ce817e63	description de oualid anglais	description teste de OUALID FRANCAIS	f	2024-12-18 14:39:19.002	2024-12-18 14:39:19.002	5a7e2d1c-6624-4ce0-933f-fa4cad35eb57	\N
585dd141-f0c9-495f-b0c5-a8a78bda0eaf	Test New Project Mamoune	Nouveau Projet Test Mamoune	f	2024-12-18 22:32:35.023	2024-12-18 22:32:35.023	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1681cec8-3bd1-45be-a828-94a980730421	This test is to see if the project is added well from promoter screen	Ce test est là pour voir si l'ajout de projet depuis le compte prommotteur fonctionne bien	f	2024-12-18 22:32:35.029	2024-12-18 22:32:35.029	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
1946e438-c1f3-466b-961a-fe70a3d7406d	New property Agency	Nouvel appartement Agence	f	2024-12-18 22:52:00.466	2024-12-18 22:52:00.466	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
84405cba-a1dd-49c6-b1e1-871c01ec5789	Test agency Property Add	Nouveau test d'ajout d'un bien	f	2024-12-18 22:52:00.474	2024-12-18 22:52:00.474	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
20169a28-53ba-4e59-b37c-486c0dcd7c2a	Luxury in New York	Appartements New York	f	2024-12-19 10:02:06.717	2024-12-19 10:02:06.717	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2fa6903f-fa6b-4d75-aee2-5fbb25b957ea	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-19 10:02:06.725	2024-12-19 10:02:06.725	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
9ad3d18c-9a12-437f-993f-5d54d71d1bb6	Luxury in New York	Appartements New York	f	2024-12-19 10:02:16.556	2024-12-19 10:02:16.556	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
563e1dc1-df41-4899-a6b4-3f490e0c791c	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-19 10:02:16.565	2024-12-19 10:02:16.565	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
fd0e9175-7035-490e-8880-76319febb8f6	Luxu New York	Apparteew York	f	2024-12-19 10:02:35.04	2024-12-19 10:02:35.04	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
009701db-04ef-43e3-b65f-11debf7c0630	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-19 10:02:35.046	2024-12-19 10:02:35.046	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c4117fc6-f413-4451-bb92-7f31f379b57f	Luxu New York	Apparteew York	f	2024-12-19 10:05:05.384	2024-12-19 10:05:05.384	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8c8534e4-a2c2-45d0-af59-f927c5709ae2	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-19 10:05:05.408	2024-12-19 10:05:05.408	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
06748449-fa3c-4139-854e-cd4e5d77d33c	Yellow 	Yellow 	f	2024-12-19 10:07:07.298	2024-12-19 10:07:07.298	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
fcb708f9-6fc4-430e-9c47-cdb914ef73a5	Fgggg I will attract and p I a positive impact on your d I will stop 	Fgggg I will attract and p I a positive impact on your d I will stop 	f	2024-12-19 10:07:07.302	2024-12-19 10:07:07.302	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
493790d8-99ce-4625-bd29-c9edd773e3b0	Yel  fgdfgflow	Yellfdgfdgfdgow	f	2024-12-19 10:13:28.948	2024-12-19 10:13:28.948	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8beeda39-e582-485e-84ff-e66f22def873	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 10:13:28.96	2024-12-19 10:13:28.96	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d022f245-c34e-46c1-ae4f-f4b8a895dfc2	Yel  fgdfgflow	Yellfdgfdgfdgow	f	2024-12-19 10:13:37.631	2024-12-19 10:13:37.631	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
91b21762-1067-4804-b151-2373cf5b2cdd	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 10:13:37.635	2024-12-19 10:13:37.635	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
5a968b02-7c2c-4de6-b506-dafe3a31dec8	Yel  fgd vvvvfgflow	Yellfdgfdgssssfdgow	f	2024-12-19 10:13:44.581	2024-12-19 10:13:44.581	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8e7366d4-4da3-4109-b76f-80fe4d4915a4	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 10:13:44.587	2024-12-19 10:13:44.587	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f278a245-0d37-4d0a-81c8-5755e6d92203	Yellfdgfdgssssfdgow	Yellfdgfdgssssfdgow	f	2024-12-19 10:13:54.069	2024-12-19 10:13:54.069	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
77de8a3d-ca91-40ce-8e0e-ce4085603936	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 10:13:54.077	2024-12-19 10:13:54.077	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4d308f4a-b6cd-4aca-9ae1-18089d628a2f	Modern Apartment	Appartement Moderne	f	2024-12-19 10:14:42.947	2024-12-19 10:14:42.947	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
2bccfed0-575e-4e7b-a810-188ff6745d3e	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:14:42.957	2024-12-19 10:14:42.957	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ca13b740-0d08-4939-a616-056ec5bccb68	Modern Apartment	Appartement Moderne	f	2024-12-19 10:17:16.728	2024-12-19 10:17:16.728	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
92360375-cf36-41ea-be69-b15b83a4b866	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:17:16.742	2024-12-19 10:17:16.742	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
50f0009c-8835-4057-ba48-3e8c741ae6e5	Modern Apartment	Appartement Moderne	f	2024-12-19 10:19:49.428	2024-12-19 10:19:49.428	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
3052c4bc-062a-45f4-b393-6f4eb9a6e6cc	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:19:49.435	2024-12-19 10:19:49.435	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
10d03448-cf51-4b79-ba9c-2ad7d111e9c8	Modern Apartment	Appartement Moderne	f	2024-12-19 10:20:03.016	2024-12-19 10:20:03.016	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ca163239-e525-4920-974a-5f0f0ff7629b	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:20:03.032	2024-12-19 10:20:03.032	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
ae767753-999d-4845-a020-bcdcc64ba477	Modern Apartment	Appartement Moderne	f	2024-12-19 10:20:12.571	2024-12-19 10:20:12.571	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
b79dbc9f-85cc-43e7-9ae5-9097f4cdc96f	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:20:12.576	2024-12-19 10:20:12.576	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
48d536fa-74b4-4ead-b793-41d2b1e987a7	Modern Apartment	Appartement Moderne	f	2024-12-19 10:21:56.528	2024-12-19 10:21:56.528	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
96268e68-6c74-46df-96e2-34d616dd25e4	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:21:56.534	2024-12-19 10:21:56.534	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
20faeb9c-5052-4a39-a712-bb03b6bbceb0	Modern Apartment	Appartement Moderne	f	2024-12-19 10:23:01.267	2024-12-19 10:23:01.267	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
02e8c829-2921-4d20-bfeb-d53b9a74154a	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:23:01.281	2024-12-19 10:23:01.281	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
cdd7d306-beeb-48ea-a6ab-556242e61ca0	Modern Apartment	Appartement Moderne	f	2024-12-19 10:37:00.856	2024-12-19 10:37:00.856	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
baf6b840-57d7-4a5e-8179-cd60bf41aa47	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-19 10:37:00.888	2024-12-19 10:37:00.888	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
65232692-bfc4-412f-b4d8-6c3701902bfc	Luxury in New York	Appartements New York	f	2024-12-19 10:37:12.275	2024-12-19 10:37:12.275	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
c256fb20-c495-4c30-a1a6-b69aa96c08b0	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-19 10:37:12.279	2024-12-19 10:37:12.279	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
f558cda7-041b-4c5c-900e-beba3c3bb968	Luxury in New York	Appartements New York	f	2024-12-19 10:43:31.832	2024-12-19 10:43:31.832	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
4d145519-8421-4341-b22f-e21db43f9ea6	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-19 10:43:31.839	2024-12-19 10:43:31.839	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
6d7bb038-9dc3-4c71-a2f8-0a157a8a4922	Yellow	Yellow	f	2024-12-19 10:48:25.172	2024-12-19 10:48:25.172	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d39e39fa-8a40-483a-8c03-1dc803412ec6	Yellow	Yellow	f	2024-12-19 11:04:37.919	2024-12-19 11:04:37.919	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
76d64f12-a788-47d7-9adb-a9b883695d86	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 11:04:37.93	2024-12-19 11:04:37.93	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
beb2f505-d5a9-4c14-a913-92084660cb3c	Yellow 1	Yellow 1	f	2024-12-19 11:04:56.723	2024-12-19 11:04:56.723	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
12a19a72-d034-4d05-b2fb-23da38287835	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 11:04:56.733	2024-12-19 11:04:56.733	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a32c86c3-0747-499c-942e-ad6e65ecfb8b	Test posts 	Test posts 	f	2024-12-19 12:57:36.542	2024-12-19 12:57:36.542	6f15a8b5-f062-4606-b663-e7c320135e2e	6f15a8b5-f062-4606-b663-e7c320135e2e
5472acbc-46d6-4bfc-8fce-b707d107c4e1	Hdhdh I will stop namaste namaste namaste namaste namaste namaste namaste namaste namaste 	Hdhdh I will stop namaste namaste namaste namaste namaste namaste namaste namaste namaste 	f	2024-12-19 12:57:36.55	2024-12-19 12:57:36.55	6f15a8b5-f062-4606-b663-e7c320135e2e	6f15a8b5-f062-4606-b663-e7c320135e2e
e88eea96-4b1e-4c91-b2d0-5dfc7c802db7	Yjgff	Yjgff	f	2024-12-17 09:10:15.762	2024-12-17 09:10:15.762	6f15a8b5-f062-4606-b663-e7c320135e2e	6f15a8b5-f062-4606-b663-e7c320135e2e
4102a435-4812-4119-a546-32df37d84954	Dhruva I will attract and peaceful and peaceful and peaceful and peaceful and peaceful	Dhruva j'attirerai et paisible et paisible et paisible et paisible et paisible	f	2024-12-17 09:10:15.769	2024-12-17 09:10:15.769	6f15a8b5-f062-4606-b663-e7c320135e2e	6f15a8b5-f062-4606-b663-e7c320135e2e
912283c2-b0c2-453d-b265-7840b908e108	Yellow 1	Yellow 1	f	2024-12-19 11:05:11.029	2024-12-19 11:05:11.029	6f15a8b5-f062-4606-b663-e7c320135e2e	e2977f3c-bd21-4577-9430-29fe0ca1cc2e
571ec140-1ad2-4cdc-86c4-ed050dd5eeb1	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 11:05:11.042	2024-12-19 11:05:11.042	6f15a8b5-f062-4606-b663-e7c320135e2e	e2977f3c-bd21-4577-9430-29fe0ca1cc2e
43b60fb4-da4f-4e74-8c8d-f60d8aace3e3	Yjgyyff	Yjgyyff	f	2024-12-19 11:25:53.315	2024-12-19 11:25:53.315	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
5a2e961a-f2a5-4009-88c5-e6c20b05ca69	Dhruva I will attract and peaceful and peaceful and peaceful and peaceful and peaceful	Dhruva I will attract and peaceful and peaceful and peaceful and peaceful and peaceful	f	2024-12-19 11:25:53.321	2024-12-19 11:25:53.321	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8ea4a5c9-2740-48c2-bdcd-fb24548f1ef0	Mrtment	Mrtment	f	2024-12-19 10:33:12.59	2024-12-19 10:33:12.59	39a4c829-4a98-4b57-a510-baaf96df1f90	6f15a8b5-f062-4606-b663-e7c320135e2e
7cf4d590-0a5f-4b7c-9936-c952f53a21e6	A beautiful apartment with modern amenities.	A beautiful apartment with modern amenities.	f	2024-12-19 10:33:12.602	2024-12-19 10:33:12.602	39a4c829-4a98-4b57-a510-baaf96df1f90	6f15a8b5-f062-4606-b663-e7c320135e2e
1ce1d3f4-a6eb-4c11-a096-6acd511a4937	Linking projects	Projet liaison	f	2024-12-20 13:30:06.858	2024-12-20 13:30:06.858	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
ad6853bf-49ae-4d71-a942-561b898a1786	Linking test projects	Projets liaison tests	f	2024-12-20 13:30:06.878	2024-12-20 13:30:06.878	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
eee4e006-8348-4d8b-a5fa-163a39d584d1	azertyu	zertyui	f	2024-12-20 13:31:32.253	2024-12-20 13:31:32.253	\N	\N
5c7dcc5b-30f6-4c3f-aaf6-b6847be05ac7	Yellow 1	Yellow 1	f	2024-12-19 11:23:00.572	2024-12-19 11:23:00.572	6f15a8b5-f062-4606-b663-e7c320135e2e	6f15a8b5-f062-4606-b663-e7c320135e2e
af591dbe-6646-4bbe-85f9-a89ca9304d2c	Fgggg I will attract and p I a positive impact on your d I will stop	Fgggg I will attract and p I a positive impact on your d I will stop	f	2024-12-19 11:23:00.583	2024-12-19 11:23:00.583	6f15a8b5-f062-4606-b663-e7c320135e2e	6f15a8b5-f062-4606-b663-e7c320135e2e
e209aa52-83b4-4c28-bbfc-3f47eaf7e105	large gardesn	grands jardin	f	2024-12-21 17:22:08.993	2024-12-21 17:22:08.993	\N	\N
2db05c3d-dea0-4707-a0cc-50f43a6dff91	large gardesn	grands jardin	f	2024-12-21 17:22:12.124	2024-12-21 17:22:12.124	\N	\N
8bd5ca48-afcb-423f-8856-a7952123851b	Test edit 	Test edit 	f	2024-12-23 09:11:25.543	2024-12-23 09:11:25.543	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
630311d0-187e-40ea-8131-64b306ee6c0c	Fluff I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful namaste namaste I 	Fluff I will attract and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful and peaceful namaste namaste I 	f	2024-12-23 09:11:25.546	2024-12-23 09:11:25.546	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
d35d3ee4-d8a3-4d3e-9278-dfd16bea3640	Mrtmednt	t Modedrne	f	2024-12-23 10:19:13.059	2024-12-23 10:19:13.059	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
0fe5c78c-574b-405d-9db5-b9e96df16e0b	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-23 10:19:13.063	2024-12-23 10:19:13.063	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
5c012bbe-2992-40b9-ab00-6ceadd756b3d	Mrtmednt	t Modedrne	f	2024-12-23 10:19:48.34	2024-12-23 10:19:48.34	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
db6dad84-9968-4684-b248-a81aac00a722	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-23 10:19:48.342	2024-12-23 10:19:48.342	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
bfbd328b-d045-4079-a573-f306e557ace5	Mrtmednt	t Modedrne	f	2024-12-23 10:19:55.323	2024-12-23 10:19:55.323	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
14b862e3-f9a5-4625-ab40-19d6403dd4fe	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-23 10:19:55.325	2024-12-23 10:19:55.325	39a4c829-4a98-4b57-a510-baaf96df1f90	\N
92595878-a889-46c4-b896-31438d5bbc4d	Create Property 3332223	t Moderne 33222333	f	2024-12-24 11:11:31.667	2024-12-24 11:11:31.667	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
3f4f3da2-4ad6-47a9-a88b-d868950dcf2f	A beautiful apartment with modern amenities.	Un bel appartement avec des équipements modernes.	f	2024-12-24 11:11:31.678	2024-12-24 11:11:31.678	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
431a9952-1e3f-4b09-9831-690e40612ee0	test	test	f	2024-12-25 06:30:49.243	2024-12-25 06:30:49.243	\N	\N
9d489949-3c31-4496-9202-14e4412b8cb2	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-24 09:22:25.27	2024-12-24 09:22:25.27	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
5d7eee07-181a-44a4-b7f9-7f11ecfd949f	Create Property 33322232	t Moderne 332223332	f	2024-12-24 13:36:43.398	2024-12-24 13:36:43.398	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
e01e557d-8705-4ada-b3ba-1ea224e2344e	A beautiful apartment with modern amenitiess.	Un bel appartement avec des équipements moderness.	f	2024-12-24 13:36:43.403	2024-12-24 13:36:43.403	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
0f4e8fae-1669-45d0-b60f-7767712cd812	Create Property 333222	t Moderne 3322233	f	2024-12-24 13:39:33.52	2024-12-24 13:39:33.52	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
a76b4956-f403-49c3-af11-5c0afc7511e8	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2024-12-24 13:39:33.523	2024-12-24 13:39:33.523	7ad46579-7906-4571-9ed8-e9b84a9c148c	\N
21401ae7-11a0-4679-9f6a-16fe877dde39	Luxury in New York	Appartements New York	f	2024-12-24 09:23:05.15	2024-12-24 09:23:05.15	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
485cc2d8-d2b0-4438-a4d9-efcd08ff88db	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-24 09:23:05.152	2024-12-24 09:23:05.152	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a855465c-81e9-4d1b-b514-e3cbc421afc3	Luxury in New York	Appartements New York	f	2024-12-24 09:38:57.759	2024-12-24 09:38:57.759	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
aed705ce-4734-4de2-ae63-d3f3965b53bb	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-24 09:38:57.762	2024-12-24 09:38:57.762	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
a7dcdfc6-f27f-4178-80b2-0f3e4efd4547	Luxury in New York	Appartements New York	f	2024-12-24 09:42:26.452	2024-12-24 09:42:26.452	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
8f748116-96f7-43e8-93ff-276f2401f2cc	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-24 09:42:26.454	2024-12-24 09:42:26.454	6f15a8b5-f062-4606-b663-e7c320135e2e	\N
2eb23ded-8c22-44c1-adc8-8edb830ec964	Luxury in New York	Appartements New York	f	2024-12-24 09:43:38.252	2024-12-24 09:43:38.252	bbc26e46-ae69-4cbb-8cb8-404bfeeee4ee	\N
ec401e96-c961-4587-af77-f89532d69470	A beautiful apartment located in the heart of the city.	Un bel appartement de luxe au cœur de la ville.	f	2024-12-24 09:43:38.256	2024-12-24 09:43:38.256	bbc26e46-ae69-4cbb-8cb8-404bfeeee4ee	\N
5384a762-32d4-4d4b-8b21-9f2e05f9e88f	Geneva	Genève	f	2024-12-31 07:31:11.323	2024-12-31 07:31:11.323	\N	\N
cbf8faa0-a2f8-42bc-ac58-352657669421	Deven test english-4hdsd	Deven test french-4hds	f	2024-12-31 08:36:02.849	2024-12-31 08:36:02.849	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
fee20ec7-30f9-4f1d-bc9e-9ca69701461f	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:36:02.853	2024-12-31 08:36:02.853	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
9068448a-313f-4d4e-b163-49d441167eaf	Deven property - english	Deven property - french	f	2024-12-31 11:47:20.776	2024-12-31 11:47:20.776	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
ada029e4-a3b4-490d-ae67-7afc63abb1a0	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2024-12-31 11:47:20.78	2024-12-31 11:47:20.78	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
0767d673-e01a-4f01-8f0d-5279c500e67d	Near subway	Near subway	f	2025-01-01 05:17:02.282	2025-01-01 05:17:02.282	\N	\N
2464cb6a-b848-4dda-933e-564f8c2b00c8	Test	Test	f	2025-01-01 10:30:40.616	2025-01-01 10:30:40.616	\N	\N
b67afd19-973c-4c57-90de-b4b710b81f6f	Test-update	Test-update	f	2025-01-01 14:48:50.59	2025-01-01 14:48:50.59	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
0316a643-60e5-46df-842c-4f3b9b5a6cc5	fghgjghjhgjghj	ghjghjhgjghjghjkghj	f	2025-01-01 14:48:50.595	2025-01-01 14:48:50.595	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
adbbe7cd-a147-4b7a-9527-8c3fd35ec060	des english.	des french.	f	2025-01-02 07:16:56.481	2025-01-02 07:16:56.481	\N	\N
0b94c4d2-d300-4926-bf86-cd4d6b48f34f	servcie english	servcie french	f	2025-01-02 07:16:56.485	2025-01-02 07:16:56.485	\N	\N
da880988-d9e3-437d-bd07-511761635a98	Test-update	Test-update	f	2025-01-01 14:49:14.729	2025-01-01 14:49:14.729	f16cbfc3-790f-4da1-90e4-35a8c51324fe	f16cbfc3-790f-4da1-90e4-35a8c51324fe
759f88a7-fe59-486e-908d-380efa2eb68f	fghgjghjhgjghj	ghjghjhgjghjghjkghj	f	2025-01-01 14:49:14.731	2025-01-01 14:49:14.731	f16cbfc3-790f-4da1-90e4-35a8c51324fe	f16cbfc3-790f-4da1-90e4-35a8c51324fe
31a5f4e3-509f-4bec-9e31-4783c9a3190e	Surat	Surat	f	2025-01-02 09:46:21.168	2025-01-02 09:46:21.168	\N	\N
8335b95b-d86f-4118-bef1-b6939818a888	Test-update	Test-update	f	2025-01-02 10:55:20.092	2025-01-02 10:55:20.092	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
405082ad-3550-41a1-9d49-f80080ba25a2	fghgjghjhgjghj	ghjghjhgjghjghjkghj	f	2025-01-02 10:55:20.095	2025-01-02 10:55:20.095	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
9752a131-85c0-483b-a596-8250e2250f19	Latest - english\t	Latest - englisfdg	f	2025-01-02 11:24:38.316	2025-01-02 11:24:38.316	\N	\N
58424d0b-94ee-42cf-92b9-0ec47e7f0f5b	update	update	f	2025-01-02 12:29:23.981	2025-01-02 12:29:23.981	\N	\N
c009d88e-e370-44a6-ad4e-5536582b593f	des english.	des french.	f	2025-01-03 05:23:28.068	2025-01-03 05:23:28.068	\N	\N
0ba54456-bbf3-42d4-b2af-7b3e8367969a	servcie english	servcie french	f	2025-01-03 05:23:28.072	2025-01-03 05:23:28.072	\N	\N
7617a8b4-4fbe-4428-93c9-26ee48848780	Testing-3	jdbfgjhfgb-3	f	2024-12-31 07:32:10.438	2024-12-31 07:32:10.438	\N	\N
faf2735f-0895-4699-8e8b-099f5758c05d	Deven test english-4hdsdd	Deven test french-4hdsd	f	2024-12-31 08:40:56.127	2024-12-31 08:40:56.127	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
82421bd4-6034-4169-81cf-ab6ae48465ec	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:40:56.131	2024-12-31 08:40:56.131	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
8aefaf41-d5a1-4dd5-b59d-aa53556f780c	Admin-englishdsjh	Admin-frenchhhfyjh	f	2024-12-31 13:05:35.474	2024-12-31 13:05:35.474	\N	\N
b6648675-3492-441a-af8e-116f5b63f052	Admin-englishfhjkhgj	Admin-frenchhhdsghjhg	f	2024-12-31 13:06:26.547	2024-12-31 13:06:26.547	\N	\N
851f05d4-3cf9-4dbe-89da-0efc67631150	Admin-englishdsghj	Admin-frenchhhfyghj	f	2024-12-31 13:08:59.427	2024-12-31 13:08:59.427	\N	\N
3c8a301b-3626-4b4f-ae53-6cb0dbf5a2c1	Rohan House	Rohan House	f	2025-01-01 05:17:19.54	2025-01-01 05:17:19.54	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
be905aac-0a54-4039-9ca7-0713b746a9fd	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 05:17:19.544	2025-01-01 05:17:19.544	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
c4f3307f-3a83-457e-ba81-891de465c02a	Testing	Testing	f	2025-01-01 10:37:20.734	2025-01-01 10:37:20.734	02ba106a-ab74-46f7-a9df-f8e62621bdd1	\N
0a713c59-6f86-4857-8584-fde47f9c2c66	Real estate agency	Real estate agency	f	2025-01-02 06:14:48.892	2025-01-02 06:14:48.892	\N	\N
e7987211-f846-4640-b5e0-64508d9ce2af	New York	New York	f	2025-01-02 06:14:48.906	2025-01-02 06:14:48.906	\N	\N
0950905c-fa3f-4c31-8bb5-f576f1e00cf9	des english.	des french.	f	2025-01-02 07:17:28.879	2025-01-02 07:17:28.879	\N	\N
0f2d0b27-2c5d-4ad5-b3f6-a8c80f6bdf23	servcie english	servcie french	f	2025-01-02 07:17:28.883	2025-01-02 07:17:28.883	\N	\N
b235f8e1-a3be-44e8-b181-4da52d960ae3	des english.	des french.	f	2025-01-02 07:17:46.59	2025-01-02 07:17:46.59	\N	\N
8c7ce086-f8d7-45b5-a25b-2aaffd470159	servcie english	servcie french	f	2025-01-02 07:17:46.593	2025-01-02 07:17:46.593	\N	\N
cceabcbf-e0b7-4626-a18f-81935a3a0773	Ahmedabad	Ahmedabad	f	2025-01-02 10:24:32.749	2025-01-02 10:24:32.749	\N	\N
b51e4ffa-bb24-4c41-8649-cd0556a27276	Gota	Gota	f	2025-01-02 11:06:32.574	2025-01-02 11:06:32.574	\N	\N
696270db-f13e-4575-88c0-6ae45d125faa	Latest - english	Latest - fdg	f	2025-01-02 11:27:58.711	2025-01-02 11:27:58.711	\N	\N
e54e42a4-f9ed-45cb-911f-38778298b8dd	update	update	f	2025-01-02 12:29:47.365	2025-01-02 12:29:47.365	\N	\N
56a2475e-9a66-4c2c-9cbb-96dfc7ae0d29	des english.	des french.	f	2025-01-03 05:35:16.672	2025-01-03 05:35:16.672	\N	\N
b2288c90-1112-4293-83c3-5590be1ecfc3	servcie english	servcie french	f	2025-01-03 05:35:16.675	2025-01-03 05:35:16.675	\N	\N
7c11b111-f158-4f39-b038-a12ec2155070	des english.	des french.	f	2025-01-03 05:35:39.543	2025-01-03 05:35:39.543	\N	\N
c9768f7a-8050-4cf4-a101-105b256cf4f1	servcie english	servcie french	f	2025-01-03 05:35:39.544	2025-01-03 05:35:39.544	\N	\N
b6ece207-3425-4d97-83a3-bd8ad7ef2bb2	Deven test english-2	Deven test french-2	f	2024-12-31 07:33:34.548	2024-12-31 07:33:34.548	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
c833504f-00fe-4d9b-86f1-511405aca3bb	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 07:33:34.553	2024-12-31 07:33:34.553	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
5e536596-d0eb-41d6-8b7d-eafa4c317727	Deven test english-4hdsdsd	Deven test french-4hdssd	f	2024-12-31 08:41:41.598	2024-12-31 08:41:41.598	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
c16d844c-32a3-481d-bd85-b243777ab102	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:41:41.601	2024-12-31 08:41:41.601	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
d9366c9e-1ef2-49d4-af26-aec90b93f51a	Deven test english-4hdsddsd	Deven test french-4hdsdsd	f	2024-12-31 08:42:16.899	2024-12-31 08:42:16.899	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
5776a8d8-1de0-4a7b-ab46-da02ff52d338	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:42:16.901	2024-12-31 08:42:16.901	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
b1119f24-9604-4b63-b3b6-ef8d8ff24e54	Gujarat	Gujarat	f	2024-12-31 13:51:11.72	2024-12-31 13:51:11.72	\N	\N
6f7a575c-9e3e-468f-9a61-d3b55b47b529	Deven english - 1	Deven french - 2	f	2025-01-01 05:39:09.226	2025-01-01 05:39:09.226	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
e9ba46b5-38ec-4051-9ac5-94940288c08f	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:39:09.23	2025-01-01 05:39:09.23	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
bef897e0-996b-43e2-99a2-546efc37fc28	Deven english - 3	Deven french - 3	f	2025-01-01 05:39:56.901	2025-01-01 05:39:56.901	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
63c15a18-5b19-4258-9d20-3773dfcf45bc	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:39:56.903	2025-01-01 05:39:56.903	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
96d4cc56-dff7-4e06-9892-472e22612633	Deven english - 4	Deven french - 4	f	2025-01-01 05:40:03.414	2025-01-01 05:40:03.414	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
708c0971-3286-4870-ae22-88a0fac89237	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:40:03.415	2025-01-01 05:40:03.415	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
74a13a2f-e972-4737-99be-5b698c692c23	Deven english - 5	Deven french - 5	f	2025-01-01 05:40:09.812	2025-01-01 05:40:09.812	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
76838056-f612-4623-8a5a-1975ae8ac1bd	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:40:09.813	2025-01-01 05:40:09.813	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
b4c5aaa2-9235-4321-947a-63079d5ada1e	Deven english - 6	Deven french - 6	f	2025-01-01 05:40:15.436	2025-01-01 05:40:15.436	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
cde1584f-388a-461c-b4e0-0ca457e0bf76	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:40:15.437	2025-01-01 05:40:15.437	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
d4830871-f16a-47cc-ae1e-064eecbb0b86	Deven english - 7	Deven french - 7	f	2025-01-01 05:40:21.494	2025-01-01 05:40:21.494	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
b5402979-c8ef-44e0-8586-1cf03472dbf6	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:40:21.495	2025-01-01 05:40:21.495	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
8aab1b96-d0e3-4e11-a3a9-e11feedbc484	Deven english - 8	Deven french - 8	f	2025-01-01 05:40:27.803	2025-01-01 05:40:27.803	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
13b8bc55-3a1b-42c4-878f-b1ab20b621b3	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-01 05:40:27.804	2025-01-01 05:40:27.804	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
f122451a-5b23-4f6a-b426-7f0a8d3c0e4c	Uday House	Uday House	f	2025-01-01 11:04:04.147	2025-01-01 11:04:04.147	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
bc59f4a1-a579-4bfc-9c16-d3809aa52f9b	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 11:04:04.153	2025-01-01 11:04:04.153	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
5e9ecfbb-b17b-47de-b030-a90538a511fb	Real estate agency	Real estate agency	f	2025-01-02 06:16:34.226	2025-01-02 06:16:34.226	\N	\N
ba74d5af-f8d8-4a0a-af7a-604facb6cb30	New York	New York	f	2025-01-02 06:16:34.229	2025-01-02 06:16:34.229	\N	\N
c7c1f2aa-d5eb-4d35-bffb-891234cc5e7c	Real estate agency	Real estate agency	f	2025-01-02 06:17:14.716	2025-01-02 06:17:14.716	\N	\N
0dbe28bf-1044-42b4-8343-9872a0b2076b	New York	New York	f	2025-01-02 06:17:14.719	2025-01-02 06:17:14.719	\N	\N
c205743c-7ed2-440c-94f2-19bb5d47c7c6	des english.	des french.	f	2025-01-02 07:24:18.464	2025-01-02 07:24:18.464	\N	\N
0687c879-e8ff-40fe-9221-a836c230a683	servcie english	servcie french	f	2025-01-02 07:24:18.467	2025-01-02 07:24:18.467	\N	\N
05545213-f517-4a19-b876-0a2eedf055e6	Viramgam	Viramgam	f	2025-01-02 10:40:17.144	2025-01-02 10:40:17.144	\N	\N
0fa97ff9-143b-4656-bb34-ef9196345690	Viramgam	Viramgam	f	2025-01-02 10:40:32.13	2025-01-02 10:40:32.13	\N	\N
69bcae4d-4f06-4556-98f2-4054b84e4640	Gota	Gota	f	2025-01-02 11:07:50.915	2025-01-02 11:07:50.915	\N	\N
63b895bc-b41e-4d54-9fb7-40f601a28a77	Viramgam	Viramgam	f	2025-01-02 11:08:37.696	2025-01-02 11:08:37.696	\N	\N
f68ab49f-bbf6-4077-8c5f-f6463dee4d7b	Latest - english	Latest - french	f	2025-01-02 11:35:38.12	2025-01-02 11:35:38.12	\N	\N
1a9b74ac-af15-4b30-96ef-041dacf2b166	update	update	f	2025-01-02 12:30:22.322	2025-01-02 12:30:22.322	\N	\N
fb69a2d3-6f72-46f6-877d-246165eb37df	final update	final update	f	2025-01-02 12:31:06.895	2025-01-02 12:31:06.895	\N	\N
bcceb1b2-cc6c-4275-a3d3-3ce8be529cfc	Deven english - 7	Deven french - 7	f	2025-01-02 13:23:21.817	2025-01-02 13:23:21.817	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
19bf8a35-e948-48c6-ac05-6ead0c316155	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-02 13:23:21.826	2025-01-02 13:23:21.826	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
2fb6cc1e-e57f-4a8d-9799-f17482a6d305	Deven english - 4	Deven french - 4	f	2025-01-03 06:52:05.194	2025-01-03 06:52:05.194	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
220270c5-00ff-4e87-ba44-d8dc8c3c6d4a	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-03 06:52:05.199	2025-01-03 06:52:05.199	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
ea8857d3-039d-434d-bfb1-a4421379f225	Deven english - 3	Deven french - 3	f	2025-01-03 06:52:38.733	2025-01-03 06:52:38.733	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
0b411c6c-74fc-43cf-9cb2-869bd450bf96	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-03 06:52:38.735	2025-01-03 06:52:38.735	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
52664cf4-4109-4020-962f-d01dc26f5ee0	Deven test english-2	Deven test french-2	f	2024-12-31 08:27:14.034	2024-12-31 08:27:14.034	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
26d3db6d-6da7-4bc2-adc3-fd0db244f684	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:27:14.039	2024-12-31 08:27:14.039	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
75047a40-4a79-468b-9000-6f2ec3f087d9	Deven House	Deven House	f	2024-12-31 10:25:03.598	2024-12-31 10:25:03.598	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
26eb10a6-ce9b-4487-a6e4-02b775dffefd	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 10:25:03.603	2024-12-31 10:25:03.603	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
c69a7bef-456e-415a-8416-2728a1ba3ac7	Ahmedabad	Ahmedabad	f	2025-01-01 05:05:12.797	2025-01-01 05:05:12.797	\N	\N
9a3566de-f133-45ed-9db0-738242399466	Rajkot	Rajkot	f	2025-01-01 05:07:53.679	2025-01-01 05:07:53.679	\N	\N
6eb25101-7562-402a-8344-3bf154dff748	Deven House	Deven House	f	2025-01-01 07:24:09.884	2025-01-01 07:24:09.884	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
92805544-d014-4369-8993-8c97cf825fbd	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 07:24:09.899	2025-01-01 07:24:09.899	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
d46998b1-4b02-44d3-bea4-feba247b651d	Test-update	Test-update	f	2025-01-01 12:25:23.472	2025-01-01 12:25:23.472	\N	\N
6feab49d-ce94-4629-a636-aecbe81b0b02	Real estate agency	Real estate agency	f	2025-01-02 06:20:35.086	2025-01-02 06:20:35.086	\N	\N
7ba4fc77-63bb-47d0-8095-520f702fa8f0	New York	New York	f	2025-01-02 06:20:35.093	2025-01-02 06:20:35.093	\N	\N
d5addfae-92bf-412d-8389-fa287e315bb2	Deven english - 8	Deven french - 8	f	2025-01-02 10:52:10.758	2025-01-02 10:52:10.758	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
6396503f-5254-46aa-9512-2d6fc134100f	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-02 10:52:10.762	2025-01-02 10:52:10.762	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
e6e020d0-dba1-4538-849c-8edbf609c2ac	Deven english - 8	Deven french - 8	f	2025-01-02 10:53:22.948	2025-01-02 10:53:22.948	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
e0e2f5bd-485a-44d5-9115-81fee1ccf4b5	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-02 10:53:22.95	2025-01-02 10:53:22.95	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
fd092a13-b3f2-4df3-af68-6938e3c99d22	Deven english - 8	Deven french - 8	f	2025-01-02 10:55:38.58	2025-01-02 10:55:38.58	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
8f715349-1677-416b-81af-aaec578ca2d0	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-02 10:55:38.583	2025-01-02 10:55:38.583	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
3d48e3ed-b9ab-4a9d-b3d3-4bd2add81b4c	Deven english - 8	Deven french - 8	f	2025-01-02 10:55:58.303	2025-01-02 10:55:58.303	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
2d265643-539c-41b1-a549-e8a835e46a19	A beautiful apartment with modern amenitie.	Un bel appartement avec des équipements moderne.	f	2025-01-02 10:55:58.305	2025-01-02 10:55:58.305	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
399b4333-90f0-4660-9395-94a28801d7b1	Gota	Unknown	f	2025-01-02 11:08:56.034	2025-01-02 11:08:56.034	\N	\N
e5f471f9-3695-4ccb-8771-4ed1a334d219	Science cityq	Science city	f	2025-01-02 11:11:30.141	2025-01-02 11:11:30.141	\N	\N
a610089b-8840-4910-9e2b-17b2e76a71a2	Latest - englishsdf	Latest - dsdsf	f	2025-01-02 11:41:12.158	2025-01-02 11:41:12.158	\N	\N
22e48728-842e-4c7f-9001-083be5b71a8c	final update english	final update french	f	2025-01-02 12:48:01.274	2025-01-02 12:48:01.274	\N	\N
241db67f-2d9b-4d99-b27c-a71a033449d5	Real estate agency english	Real estate agency french	f	2025-01-02 17:25:56.101	2025-01-02 17:25:56.101	\N	\N
60ed7d83-c93b-48a7-bb2d-bd3ee38048b8	New York english	New York french	f	2025-01-02 17:25:56.105	2025-01-02 17:25:56.105	\N	\N
70334322-2076-42fa-97bc-2dd1273179db	des update.	des update fr.	f	2025-01-02 07:25:30.839	2025-01-02 07:25:30.839	\N	\N
3e139604-3727-434f-b3c4-1745a139103a	servcie update	servcie update fr	f	2025-01-02 07:25:30.843	2025-01-02 07:25:30.843	\N	\N
de73257a-f400-4f0d-8a77-9314d211e0d1	Deven test english-3	Deven test french-3	f	2024-12-31 08:30:11.763	2024-12-31 08:30:11.763	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
418e1dc3-f1d5-4f49-bddf-86bc9b193323	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:30:11.767	2024-12-31 08:30:11.767	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
579757bb-37f2-4f0f-b32a-ece54d50b9bd	Uday House	Uday House	f	2024-12-31 10:39:05.682	2024-12-31 10:39:05.682	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
a9c7edf0-d25b-4d4a-99cc-bf242e3225b0	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 10:39:05.686	2024-12-31 10:39:05.686	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
6763aabb-0ac8-4262-bf7c-4681fa5b280c	Rohan House	Rohan House	f	2025-01-01 05:09:59.634	2025-01-01 05:09:59.634	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
81b577c4-4c68-4554-9f6e-14118a4f4ac0	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 05:09:59.638	2025-01-01 05:09:59.638	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
4acae255-dcfb-4a32-b6d2-757bc3d0c5ee	Rohan House	Rohan House	f	2025-01-01 05:10:31.098	2025-01-01 05:10:31.098	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
92cbdf2d-e2d6-4f44-89fd-9d91d2b661e3	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 05:10:31.099	2025-01-01 05:10:31.099	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
057add0b-fdf3-4302-8608-fdfdf0e0a3ed	Rohan House	Rohan House	f	2025-01-01 05:12:27.6	2025-01-01 05:12:27.6	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
b0fa0a02-4166-4004-a35f-87869460b888	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 05:12:27.601	2025-01-01 05:12:27.601	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
a01ff332-de69-4cdc-bd27-1ded24c4648c	Rohan House	Rohan House	f	2025-01-01 05:12:49.417	2025-01-01 05:12:49.417	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
dafdec1e-0138-4c3f-822a-2bc42a795259	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2025-01-01 05:12:49.418	2025-01-01 05:12:49.418	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
8d69dcb0-7198-41a3-8141-a52e12eadb05	Test-update-english	Test-update-french	f	2025-01-01 12:32:01.459	2025-01-01 12:32:01.459	\N	\N
3f3dc5ed-391a-446e-98a0-bcad37bcb99e	Real estate agency english	Real estate agency french	f	2025-01-02 06:21:52.612	2025-01-02 06:21:52.612	\N	\N
ed55e532-5ce5-463e-9afd-2c627e092b2b	New York english	New York french	f	2025-01-02 06:21:52.616	2025-01-02 06:21:52.616	\N	\N
62bb43b0-cd71-47b0-8c77-9eb59fd232aa	Update english	Update french	f	2025-01-02 06:22:25.574	2025-01-02 06:22:25.574	\N	\N
a645c635-4724-41b6-b08e-ec0772008b80	Update english	Update french	f	2025-01-02 06:22:25.577	2025-01-02 06:22:25.577	\N	\N
6c4e9d9f-3bd8-4906-8a55-0f8d6886a49b	Rajkot - english	Rajkot - french	f	2025-01-02 09:20:31.539	2025-01-02 09:20:31.539	\N	\N
56909ed3-c203-42f3-8df6-904a7f118f19	Testing	Testing	f	2025-01-02 10:53:00.307	2025-01-02 10:53:00.307	\N	\N
e0b586ae-7c75-4599-946f-fe5ff3b68044	Testing - english	Testing - french	f	2025-01-02 11:15:45.332	2025-01-02 11:15:45.332	\N	\N
de938b9e-aba8-4204-bb88-eceefc841430	Silver harmoney	Silver Harmoney	f	2025-01-02 11:44:16.12	2025-01-02 11:44:16.12	\N	\N
f3812268-dd94-4e5a-a56d-1cbe020c0c8a	Test - english - 1	Test - french - 1	f	2025-01-03 04:36:08.071	2025-01-03 04:36:08.071	\N	\N
ae57de1f-7608-4d4e-8c5c-b264726f3721	service - english - 1	service - french - 1	f	2025-01-03 04:36:08.075	2025-01-03 04:36:08.075	\N	\N
b4d1dbd5-695c-4ebd-af26-0df9580413e4	Deven test english-4	Deven test french-4	f	2024-12-31 08:32:31.996	2024-12-31 08:32:31.996	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
a0541244-7733-4677-9712-c04b36c73e26	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:32:32	2024-12-31 08:32:32	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
5914a8fd-4bcf-45df-8fad-e153b80e5c1c	Deven test english-4h	Deven test french-4h	f	2024-12-31 08:33:16.682	2024-12-31 08:33:16.682	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
0d3088ec-2784-4d52-a8be-96b6f7080c60	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:33:16.684	2024-12-31 08:33:16.684	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
34661d3d-59da-4d20-964f-cfca566cd625	Deven test english-4h	Deven test french-4h	f	2024-12-31 08:33:50.412	2024-12-31 08:33:50.412	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
2555cb0c-de1c-4181-8a9a-35a037edf8ef	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 08:33:50.414	2024-12-31 08:33:50.414	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
e6b93667-0ab6-42b2-86f3-251624023d0f	Rohan House	Rohan House	f	2024-12-31 11:25:33.104	2024-12-31 11:25:33.104	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
967a30bc-7119-4b6a-8a6e-9a355bcc56f8	A beautiful apartment located in the heart of the cityii.	Un bel appartement de luxe au cœur de la villeii.	f	2024-12-31 11:25:33.109	2024-12-31 11:25:33.109	24d25b76-221e-4579-b4a4-3d6a4b187143	\N
2b66a701-b2f6-46bd-947f-09476f972808	Science city	Science city	f	2025-01-01 05:12:11.044	2025-01-01 05:12:11.044	\N	\N
e8413e1b-e173-421e-ad87-54bd4922b03c	Gota	Gota	f	2025-01-01 09:11:41.765	2025-01-01 09:11:41.765	\N	\N
7c4945bb-db93-4c0e-bfaf-c64db610bd0b	Test-update	Test-update	f	2025-01-01 14:41:51.284	2025-01-01 14:41:51.284	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
b3076e02-5b95-4bfc-ace9-74b0c27b03e5	sdffrgdfhrgtfh	trhtrhrthtrhrth	f	2025-01-01 14:41:51.286	2025-01-01 14:41:51.286	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
c333a422-65b5-4520-a513-0dbb86c0ff2f	des english.	des french.	f	2025-01-02 07:09:25.243	2025-01-02 07:09:25.243	\N	\N
67478fc7-4cb0-4ada-b2c1-ac7106fefa70	servcie english	servcie french	f	2025-01-02 07:09:25.247	2025-01-02 07:09:25.247	\N	\N
c07254c7-d854-4c68-9c85-37f5ca3a1b4d	des english.	des french.	f	2025-01-02 07:09:45.785	2025-01-02 07:09:45.785	\N	\N
96f737f4-8781-4da6-b638-cad35280ce36	servcie english	servcie french	f	2025-01-02 07:09:45.787	2025-01-02 07:09:45.787	\N	\N
f22bd2cf-0c28-4c58-9ffc-f621826fc14f	Rajsthan	Rajsthan	f	2025-01-02 09:36:16.247	2025-01-02 09:36:16.247	\N	\N
d62083db-8d69-4d6b-abf4-a95e204fff48	Test-update	Test-update	f	2025-01-02 10:54:23.059	2025-01-02 10:54:23.059	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
3c1569d8-8689-4de7-883d-21edef6b7b7e	fghgjghjhgjghj	ghjghjhgjghjghjkghj	f	2025-01-02 10:54:23.062	2025-01-02 10:54:23.062	f16cbfc3-790f-4da1-90e4-35a8c51324fe	\N
f7e03ea0-1a8e-471a-9970-96ee6c8db38a	Latest - english 	Latest - french	f	2025-01-02 11:20:27.55	2025-01-02 11:20:27.55	\N	\N
253b2ecf-0d25-44cc-87c0-d29ab546af77	Silver harmoney	Silver harmoney	f	2025-01-02 11:46:54.233	2025-01-02 11:46:54.233	\N	\N
c4441ae8-0cff-480c-88ef-e66b20a13e41	Test - english - 2	Test - french - 2	f	2025-01-03 04:43:04.138	2025-01-03 04:43:04.138	\N	\N
f5607d04-887e-44d9-a495-d15095553f26	service - english - 2	service - french - 2	f	2025-01-03 04:43:04.142	2025-01-03 04:43:04.142	\N	\N
52922123-759f-4b78-b334-55444d9afd6f	Update english fff	Update french fff	f	2025-01-03 04:43:33.169	2025-01-03 04:43:33.169	\N	\N
d5a05f71-fdb9-473c-a624-e3eb0c35db0e	Update english fff	Update french fff	f	2025-01-03 04:43:33.17	2025-01-03 04:43:33.17	\N	\N
\.


--
-- TOC entry 5070 (class 0 OID 76842)
-- Dependencies: 223
-- Data for Name: meta_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.meta_data (id, title, description, keyword, is_deleted, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- TOC entry 5079 (class 0 OID 77027)
-- Dependencies: 232
-- Data for Name: neighborhoods; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.neighborhoods (id, district_id, lang_id, latitude, longitude, is_deleted, created_at, updated_at, created_by, updated_by) FROM stdin;
5afe9998-5b92-45b9-a90f-d542d6742014	afe080a5-eb93-4f0b-9998-14e51afff547	431a9952-1e3f-4b09-9831-690e40612ee0	33.985047	-118.469483	f	2025-01-02 10:55:02.995	2025-01-02 10:55:02.995	\N	\N
97c692e2-e5a1-420c-afa8-64d92ae90b4c	afe080a5-eb93-4f0b-9998-14e51afff547	22e48728-842e-4c7f-9001-083be5b71a8c	33.985047	-118.469483	f	2025-01-02 11:46:54.236	2025-01-02 12:48:01.276	02ba106a-ab74-46f7-a9df-f8e62621bdd1	02ba106a-ab74-46f7-a9df-f8e62621bdd1
\.


--
-- TOC entry 5080 (class 0 OID 77036)
-- Dependencies: 233
-- Data for Name: project_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_details (id, state_id, city_id, district_id, vr_link, video, status, user_id, is_deleted, created_at, updated_at, created_by, updated_by, title, description, neighborhoods_id, address, latitude, longitude, currency_id, price, icon, picture) FROM stdin;
\.


--
-- TOC entry 5081 (class 0 OID 77048)
-- Dependencies: 234
-- Data for Name: project_meta_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_meta_details (id, project_detail_id, value, is_deleted, created_at, updated_at, created_by, updated_by, project_type_listing_id) FROM stdin;
\.


--
-- TOC entry 5082 (class 0 OID 77059)
-- Dependencies: 235
-- Data for Name: project_type_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_type_listings (id, icon, is_deleted, created_at, updated_at, created_by, updated_by, name, type, key, category, status) FROM stdin;
2bb87c39-a85b-4260-b695-4ccb448c63ca	ic_outline-bedroom-child.png	f	2024-12-09 10:23:43.187	2024-12-09 10:23:43.187	39e7570b-405f-46c8-89a8-55505c695c5c	\N	7f450767-118b-4537-a66e-2314d5159e92	number	chambres	1	f
ec50ae36-a00e-48a0-b0cf-32ffed39a151	elevator	f	2024-12-09 10:36:13.306	2024-12-09 10:36:13.306	39e7570b-405f-46c8-89a8-55505c695c5c	\N	47329297-158a-4628-bc6d-ee0cb7a8da8a	boolean	elevator	1	f
ad7cc20d-b21d-4fd6-9516-ca7626096d13	playground	f	2024-12-10 11:23:38.088	2024-12-10 11:23:38.088	39e7570b-405f-46c8-89a8-55505c695c5c	\N	462743be-a868-4f76-8497-455847c0d41c	boolean	playground	1	f
3e16927d-ed2c-4658-9b75-96af9e1ac67c	https://api.immofind.ma/uploads/DALLÂ·E 2024-11-11 21.44.05 - A real estate agency employee at CASA Immobilier viewing the IMMOFIND dashboard, where a flash offer of a 3% discount is set for a high-interest lead .webp	f	2024-12-20 13:31:32.265	2024-12-20 13:31:32.265	\N	\N	eee4e006-8348-4d8b-a5fa-163a39d584d1	number	123456789	1	f
22cc7300-0830-4089-b5b2-216b2f83e35d	pool	f	2024-12-09 10:36:36.598	2024-12-09 10:36:36.598	39e7570b-405f-46c8-89a8-55505c695c5c	\N	93add89c-f4bd-4bb2-83ed-bb3249ce245f	boolean	pool	1	t
ccafd7f7-6082-4221-bc97-1a597baf89fd	https://api.immofind.ma/uploads/bathrooms.png	f	2024-12-09 10:35:44.145	2024-12-09 10:35:44.145	39e7570b-405f-46c8-89a8-55505c695c5c	\N	14a68d22-2a4c-4ea2-b132-00075e385979	number	bathroom_rounded	1	f
\.


--
-- TOC entry 5071 (class 0 OID 76853)
-- Dependencies: 224
-- Data for Name: property_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_details (id, price, state_id, city_id, district_id, vr_link, video, status, user_id, is_deleted, created_at, updated_at, created_by, updated_by, project_id, size, transaction, type, title, description, picture, currency_id, neighborhoods_id, address, latitude, longitude) FROM stdin;
\.


--
-- TOC entry 5072 (class 0 OID 76865)
-- Dependencies: 225
-- Data for Name: property_meta_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_meta_details (id, property_detail_id, value, is_deleted, created_at, updated_at, created_by, updated_by, property_type_id) FROM stdin;
\.


--
-- TOC entry 5073 (class 0 OID 76876)
-- Dependencies: 226
-- Data for Name: property_type_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_type_listings (id, icon, is_deleted, created_at, updated_at, created_by, updated_by, category, key, type, name, status) FROM stdin;
41a76341-8df8-49f1-8552-0a60908e3b5b	https://api.immofind.ma/uploads/terrasse.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	terrasse	boolean	e3f0aa37-67f6-4cc9-9e15-0a70e5339471	f
160a93c1-1a19-483d-be24-062cc4d06dd5	https://api.immofind.ma/uploads/gym.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	gym	boolean	d872c760-d78f-463f-a865-b91080654551	f
357fa3d9-5948-4380-a29c-73bb3ab8ef3d	https://api.immofind.ma/uploads/equipped-kitchen.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	equipped-kitchen	boolean	6887e157-8a5a-4b8e-961f-e88499b9f9a6	f
6023000f-1d4a-420d-8534-912ba86b84fd	https://api.immofind.ma/uploads/double-glazing.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	double-glazing	boolean	b86e7e34-a043-4fb6-bb33-57eb53d8d61f	f
698f7dd8-c86b-40cb-8857-9187782ad87d	https://api.immofind.ma/uploads/security.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	security	boolean	45bd4d25-3437-4f7a-b63f-88d804b9d3af	f
701da879-9ffc-4e3a-b20e-996a4048408b	https://api.immofind.ma/uploads/central-heating.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	central-heating	boolean	55e15599-7c6b-40ba-9855-796958912af8	f
7baef808-982d-4eb6-a3fd-b09847ccde5b	https://api.immofind.ma/uploads/chimney.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	chimney	boolean	afdb42c9-628d-4ce4-9561-45770d5bb55b	f
7ec20c8d-df50-41d2-839b-f4f181cb0b97	https://api.immofind.ma/uploads/dining-room.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	dining-room	boolean	a8b42e2b-9d9d-4648-abca-f41eaaac4f5b	f
88eac375-3cce-41ef-9b06-e30be522f0e5	https://api.immofind.ma/uploads/central-air-conditioning.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	central-air-conditioning	boolean	21d0a263-b975-4312-92c5-2277c0b61d8c	f
8b7415bd-7f18-42bb-a6e8-7911a72cd0f1	https://api.immofind.ma/uploads/secure-residence.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	secure-residence	boolean	cace6dbb-a88f-4d6e-9144-71a1a3b33b2f	f
8ee94e43-afa0-45be-b783-849ae9b833b6	https://api.immofind.ma/uploads/bathrooms.png	f	2024-11-26 17:35:54.864212	2024-11-26 17:35:54.864212	\N	\N	1	bathrooms	number	2c595e5e-fb64-4b3f-b40e-be4831ecc918	f
97e62dff-f9aa-469a-b576-59102766ba3a	https://api.immofind.ma/uploads/premium-finish.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	premium-finish	boolean	951fa7f6-59ec-460e-9fd7-6555ad3f6e97	f
a3bfc4be-bf65-4159-a557-75e9faf6642c	https://api.immofind.ma/uploads/green-space.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	green-space	boolean	c4ba03e7-b072-43ae-9963-c36b6cf64448	f
bf2ca816-ec44-4d45-98b2-cc2d0286b401	https://api.immofind.ma/uploads/pool.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	pool	boolean	af551be4-e484-4d37-b16a-b0e8587bed15	f
cabbcf86-d585-486b-918a-fb82347cb7b7	https://api.immofind.ma/uploads/elevator.pn	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	elevator	boolean	35009945-773b-4901-9954-80d96376a02f	f
efe3d455-ba33-4d97-8b14-fb0d779d15a9	https://api.immofind.ma/uploads/parking.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	parking	boolean	85fbf420-c614-4b70-9b7f-642d9889c17f	f
10b550bf-e3b5-432b-beb3-69f10f08b55d	https://api.immofind.ma/uploads/rooms.png	f	2024-11-26 17:35:54.864212	2024-11-26 17:35:54.864212	\N	\N	1	rooms	number	f773a4d3-501f-42b7-bc5f-f225d18402fa	f
13a28024-cc05-48ff-b0cc-5e0689a2345c	https://api.immofind.ma/uploads/dressing-room.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	dressing-room	boolean	c7ffdcea-0576-435d-ba0c-44daec22dee9	f
1a55506c-189c-4825-96a5-dfc3c81a4fa3	https://api.immofind.ma/uploads/furniture.png	f	2024-11-26 17:35:54.864212	2024-11-26 17:35:54.864212	\N	\N	2	furniture	boolean	fc9e143b-3fb3-4490-8354-63fd7eeb7f52	f
24077329-5ce6-4db3-bf83-861d9a9df295	https://api.immofind.ma/uploads/rental-investemt.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	rental-investment	boolean	bef53dd1-dd65-42bc-b212-e2f96e897260	f
34327a24-874b-466c-b6de-92ccaf14880e	https://api.immofind.ma/uploads/garage.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	garage	boolean	d1fe34e4-071c-4af1-91bc-1a44d30c1758	f
c78d0c0f-97de-4d30-9302-fc11a76d9bed	https://api.immofind.ma/uploads/larg-garden.png	f	2024-12-13 07:45:47.697	2024-12-13 07:45:47.697	\N	\N	1	large gardenss	number	ac306148-ab28-4d51-badb-88db4868571f	f
e8485f2e-d5ff-4404-946c-f644da1b8dae	https://api.immofind.ma/uploads/fairs.png	f	2024-11-26 17:35:54.864212	2024-11-26 17:35:54.864212	\N	\N	1	fairs	number	76ce2eaf-f63f-4b7f-aef4-6e02fee1fb4a	f
96e345c0-799c-4568-a0e9-1a8cbd33c8fa	https://api.immofind.ma/uploads/larg-garden.png	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	garden	boolean	62eed3ec-a045-4047-ade7-e32076aeb72e	f
4f793d8f-d2ca-4dc3-a339-b55845c15c87	icon.png	f	2024-12-17 06:12:14.782	2024-12-17 06:12:14.782	\N	\N	1	large gardenss	number	c45f4882-fee4-4c2e-8866-fc99c83c7249	f
a176a486-b0f6-452d-b676-b56e5a6f555c	icon.png	f	2024-12-21 17:22:09.038	2024-12-21 17:22:09.038	\N	\N	1	large gardenss	number	e209aa52-83b4-4c28-bbfc-3f47eaf7e105	f
478dc63b-9389-411b-9afb-e61d2d758a40	icon.png	f	2024-12-21 17:22:12.136	2024-12-21 17:22:12.136	\N	\N	1	large gardenss	number	2db05c3d-dea0-4707-a0cc-50f43a6dff91	f
9a89f6ff-6aef-4482-b768-220892e9c933	\N	f	2024-11-27 00:13:40.421552	2024-11-27 00:13:40.421552	\N	\N	1	new-project	boolean	6a47232c-dfb3-4de3-be6c-d106ba4ecb8d	f
\.


--
-- TOC entry 5074 (class 0 OID 76887)
-- Dependencies: 227
-- Data for Name: property_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.property_types (id, is_deleted, created_at, updated_at, created_by, updated_by, title, status) FROM stdin;
540ac7c0-c2ac-403b-8fe7-2fed7b5c43a4	f	2024-12-17 06:11:36.917	2024-12-17 06:11:36.918	c3bcbd87-aa5a-4634-b37c-1447a7702aeb	\N	19991945-127c-43aa-9aee-067c01ff4655	t
5ed496da-86f0-44a0-abd8-d04ab9d8609e	f	2024-11-26 17:27:39.888906	2024-11-26 17:27:39.888906	c3bcbd87-aa5a-4634-b37c-1447a7702aeb	\N	1a75b6ed-94e2-4087-8144-9997b72e65d9	f
63221d2c-3ab2-49b0-b593-d4a77d134df9	f	2024-11-26 17:28:44.090516	2024-11-26 17:28:44.090516	c3bcbd87-aa5a-4634-b37c-1447a7702aeb	\N	1ac1ed01-a333-4349-a458-0959b6e38d7c	f
dab2250c-2b5f-41de-9e43-1fd203ec8e49	f	2024-11-26 17:28:44.090516	2024-11-26 17:28:44.090516	c3bcbd87-aa5a-4634-b37c-1447a7702aeb	\N	9ad13be7-aa16-456b-b554-03f1c44a72f7	f
e838c337-cd30-46d4-9d4b-90d4ca27964a	f	2024-11-26 17:28:44.090516	2024-11-26 17:28:44.090516	c3bcbd87-aa5a-4634-b37c-1447a7702aeb	\N	428add31-4d2c-44ec-a10a-ba79ab1e6065	f
fc5893b9-1794-490d-b755-2ed52c00f950	f	2024-12-17 06:10:39.195	2024-12-17 06:10:39.196	c3bcbd87-aa5a-4634-b37c-1447a7702aeb	\N	13678994-d7b6-4d6d-abd7-d79307361333	f
\.


--
-- TOC entry 5075 (class 0 OID 76898)
-- Dependencies: 228
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, is_deleted, created_date, updated_date, status) FROM stdin;
c326e1e2-6f82-4af4-ba25-06029eba658f	user	f	2024-10-16 12:40:07.781829	2024-10-16 12:40:07.781829	t
c326e1e2-6f82-4af4-ba25-06029eba6569	agency	f	2024-10-16 12:40:07.781829	2024-10-16 12:40:07.781829	t
e626e1e2-6f82-4af4-ba25-06029eba658f	admin	f	2024-10-16 12:40:07.781829	2024-10-16 12:40:07.781829	t
c326e1e2-6f82-4af4-ba25-06029eba688f	developer	f	2024-10-16 12:40:07.781829	2024-10-16 12:40:07.781829	t
\.


--
-- TOC entry 5076 (class 0 OID 76910)
-- Dependencies: 229
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (id, key, value, is_deleted, created_at, updated_at, created_by, updated_by) FROM stdin;
\.


--
-- TOC entry 5077 (class 0 OID 76921)
-- Dependencies: 230
-- Data for Name: states; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.states (id, is_deleted, created_at, updated_at, created_by, updated_by, lang_id, latitude, longitude) FROM stdin;
7d835311-8b5b-4b02-b7d5-4bc4d90469d0	f	2024-12-31 13:51:11.723	2024-12-31 13:51:11.723	02ba106a-ab74-46f7-a9df-f8e62621bdd1	\N	b1119f24-9604-4b63-b3b6-ef8d8ff24e54	22.6708	71.5724
efac6b06-7135-4784-bbbe-cb233725894c	f	2025-01-02 09:36:16.252	2025-01-02 09:36:29.845	02ba106a-ab74-46f7-a9df-f8e62621bdd1	02ba106a-ab74-46f7-a9df-f8e62621bdd1	f22bd2cf-0c28-4c58-9ffc-f621826fc14f	27.0238	74.2179
\.


--
-- TOC entry 5078 (class 0 OID 76932)
-- Dependencies: 231
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, user_name, fcm_token, password, email_address, address, reset_password_token, image, user_login_type, is_deleted, created_at, updated_at, role_id, status, country_code, email_password_code, phone_password_code, social_id, mobile_number) FROM stdin;
b9b458ff-2145-4fc3-a202-24f1b133735f	Najat Benmoussa	Najat Benmoussa	fGLKgx-FSHqjuQzJVIGZ6r:APA91bEarTEnMAbbAx8ZpqZ2xysP1dhJ6AzbRJMq1RTmrgtPiTBWi6opCXCo6x3nKMrX8AqhSz8hLjdU9Pu63r0oyoOhXOZhM7WT1rzScGACnxh13a2sFdw	\N	najatbenmoussa59@gmail.com	\N	\N	\N	GOOGLE	f	2024-12-05 20:05:27.715	2024-12-05 20:05:27.715	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	107810164386793502880	\N
49567a92-a860-4243-8f36-1d3dd3ca640b	vilad	vilad	d6Sp-KxsRXOCpbPx9lUumk:APA91bHOq938FdNe9Wq_LwL09AeW9uamqSXTbWL3bqYA4w47Pk8cLvLrIx30R8OIQv8TUOSxl-lQpLleW4rfCdStkmhr2fxhugkid6UgJzi9-8y6Zip6Uss	$2b$10$6VBDnioY5k0tZFV6wHU3OuO3WKYjL918mMQhIgCYgF/YTrTKY4xoW	vilas@gmail.com	\N	\N	\N	NONE	f	2024-12-06 07:20:26.473	2024-12-06 07:20:26.473	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	718319	\N	\N	2580963134
249b3cb2-2e36-4606-b70d-8fd792d55a5b	\N	\N	\N	\N	shrutipael221290@gmail.com	\N	\N	\N	NONE	f	2024-12-06 11:54:12.564	2024-12-06 11:54:12.564	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	601493	\N	\N	\N
84774477-0bba-4a85-aeb7-459f0b3a7433	ad	ad	\N	$2b$10$5p9qyhS1g89cVf3Dp8O6XuE11koEKlOE59hbrED2mQAApOHyCmYwa	adilhanafi@outlook.com	\N	\N	\N	NONE	f	2024-12-05 19:54:00.616	2024-12-05 19:54:00.616	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	473319	\N	\N	660456340
02ba106a-ab74-46f7-a9df-f8e62621bdd1	admin	admin		$2b$10$3MPX1OP3jGYyuvesRSk52Oy.pbBcBarw5vLQ0eDrT/xqXjTaLXJJi	admin@gmail.com	\N	\N	https://staging.immofind.ma/images/avatar/user-image.png	NONE	f	2024-11-11 04:54:18.487	2024-11-11 04:54:18.487	e626e1e2-6f82-4af4-ba25-06029eba658f	t	\N	740144	\N	\N	1222222
405514f2-92d5-407b-af62-ef6f5f71cbf0	Harshil	Harshil			harshil.initiotechmedia@gmail.com	\N	\N		NONE	f	2024-12-03 09:39:55.099	2024-12-03 09:39:55.099	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	500817	\N	\N	9638615728
488f9433-4c3a-49e4-87c9-df4b5e96e87e	meet	dabhi meet	dD_reYPiQfSMl6V04F9i_2:APA91bFRe6wymle8im65YOXATExlwfyDqDjzuzQbpg6hIcKiIY19mMDTnAbiP15gt8LjpFbhLlO8DEYGEemR6F8FkDvhisEG8azFVsrJXkcvzme8z-eLZwg		rajesh@gmail.com	\N	\N	https://staging.immofind.ma/images/avatar/user-image.png	NONE	f	2024-11-28 04:19:57.168	2024-11-28 04:19:57.168	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	913996	722944	\N	8487002442
52d75131-ca5a-47e8-bb70-f970f7bc56ea	rohan	rohan dabhi	dD_reYPiQfSMl6V04F9i_2:APA91bFRe6wymle8im65YOXATExlwfyDqDjzuzQbpg6hIcKiIY19mMDTnAbiP15gt8LjpFbhLlO8DEYGEemR6F8FkDvhisEG8azFVsrJXkcvzme8z-eLZwg		faldu@gmail.com	\N	\N	https://staging.immofind.ma/images/avatar/avt-6.jpg	NONE	f	2024-11-27 11:24:26.161	2024-11-27 11:24:26.161	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	978510	\N	5555555555555
39a4c829-4a98-4b57-a510-baaf96df1f90	immofindmaroc	immofindmaroc	\N	$2b$10$9FAfz3x8phSA.fALiyxn/exG/QHUjWOxmqRQV8v7bDE6/WsOzqT52	immofindmaroc@gmail.com	\N	\N	\N	NONE	f	2024-12-05 12:49:24.348	2024-12-05 12:49:24.348	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	2131123123
96fc67dd-df1a-476b-9e98-45f14d5dc5d5	Gala 	Gala 	\N	$2b$10$2lco0v7l7cLu7uPCFuMEfO3WChCnWzsWBAJHJ8VCObEmqwXcUg6/m	gala_group@gmail.com	\N	\N	https://api.immofind.ma/uploads/black-woman-call-center-portrait-600nw-2328464519.webp	NONE	f	2024-12-16 10:41:54.509	2024-12-16 10:41:54.509	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	8989898989
6db25eca-1574-4395-85ae-1af97152f4da	\N	\N	\N	\N	royalconstruction@gmail.com	\N	\N	\N	NONE	f	2024-12-03 10:04:07.869	2024-12-03 10:04:07.869	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	699952	\N	\N	\N
5a7e2d1c-6624-4ce0-933f-fa4cad35eb57	name developeroualid@gmail.com	name developeroualid@gmail.com	\N	$2b$10$pCSwIw/whnanoXSwaI0fb.kG2cqk0ovDl8l0JFe8vElhF848Y0naS	developeroualid@gmail.com	\N	\N	\N	NONE	f	2024-12-05 14:02:37.74	2024-12-05 14:02:37.74	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1
372a026a-d4e5-4cc3-a92f-e4536f3dc010	Mamoune Baiz	Mamoune	eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjOGEyMGFmN2ZjOThmOTdmNDRiMTQyYjRkNWQwODg0ZWIwOTM3YzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTIwMjYzMDA1ODYzOTA4OTk3MjAiLCJlbWFpbCI6Im1hbW91bmUuYmFpekBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmJmIjoxNzMzNDE1MjM3LCJuYW1lIjoiTWFtb3VuZSBCYWl6IiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0l4V1hDNzZEMkpjMDFQVjNhZmF6VVhpVE0zdmNHMGM3c1VON3NENnh3UTBBaFV2d01EPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Ik1hbW91bmUiLCJmYW1pbHlfbmFtZSI6IkJhaXoiLCJpYXQiOjE3MzM0MTU1MzcsImV4cCI6MTczMzQxOTEzNywianRpIjoiMmYyOTg1MWUyZDBmZmQzZmIxZWVkMzg5OTNhMWExZTFhOTk2OTNiOSJ9.XIIJpzv5gvY4IlhwJaU-UHnxLu22Ce5LTnz2jwFiiFhiYJu2h-1zpIfQPNADWYrhLUarzI-HYikZwIt5EO9dohAgIaWjVwpzQxhS0BM8w5cmFEZeNrXwHJI5bhD64qMg2uML-xwoU1UqHfST87GTfA7k6rV1NWNeWCk4ps4_T3pUnVNN4Aygl0vM9R1QDRDyHhf1cZEQ56fBHEGV5xrXPleNUc9vEa3x91gr1oYipznkSOcJxsUWMBxEdqDlvHf8xKApujI_sb9tCENyM4_QuY-o0c5Ln1UbD6lnT25jGCIojyv-IQLA2YiSZV2envB9QuqmeDJyeump6m0KRCmz4w	\N	mamoune.baiz@gmail.com	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIxWXC76D2Jc01PV3afazUXiTM3vcG0c7sUN7sD6xwQ0AhUvwMD=s96-c	GOOGLE	f	2024-12-05 16:19:00.607	2024-12-05 16:19:00.607	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	112026300586390899720	\N
9fa98519-324f-4636-aba5-b5aae388e697	Oualid test	Oualid test			oualid07elhasnaoui@gmail.com	\N	\N	https://api.immofind.ma/uploads/oualid_picture.jpg	NONE	t	2024-12-03 14:09:20.796	2024-12-03 14:09:20.796	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	616000000
fb502ec7-9751-4f34-9827-750a6c01af65	\N	\N	\N	\N	ishadabhi.initotechmedia.com@gmail.com	\N	\N	\N	NONE	f	2024-12-10 06:02:37.852	2024-12-10 06:02:37.852	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	840033	\N	\N	\N
67eba7f5-6cfc-4f9a-be85-da9ec4f4e233	Test	Test	\N	$2b$10$LtDCrIjC.2ifL4IlijhznO.mfIF9v8aa1KFa.iLSirWtHvvQh/oSS	ultimjoker@gmail.com	\N	\N	\N	NONE	f	2024-12-05 19:39:16.951	2024-12-05 19:39:16.951	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	675105687
84d1164c-9fed-4405-a226-b3a74a663e22	\N	\N	\N	\N	agency3@gmail.com	\N	\N	\N	NONE	f	2024-12-12 05:17:33.78	2024-12-12 05:17:33.78	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	770421	\N	\N	\N
7de500c4-a561-46bd-b730-b3895a84663f	Near Shack	Near	EAA0SIgCahCQBOZCXLlw2VrTKCBqdTZCz1f51Px8B2KYyHiXUoeZAXfJXD7SkfJbe2ZAxfNYZBUwALJehNWQjnguZB2yZBB2LiUe2ewjpQJBTUcWnGiD0a61Xksdp05Pqmyfmp11ZAt8moYPZCAZBVGzQprDhSQbFZCxluWOqZAle0ng4Tlu7An9QCwS6hQAWIb7TMNULtPZBjRjJ6mHCeZC79j8QZDZD		mynearshack@gmail.com	\N	\N	https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=884653507166073&height=50&width=50&ext=1735809789&hash=AbY9HtvGRGk4JxAFpdf1Z3kT	FACEBOOK	f	2024-12-03 09:23:10.775	2024-12-03 09:23:10.775	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	\N
59f28454-5e75-4125-afe9-5f79a2557ece	\N	\N	\N	\N	rajdddddddddddddubhai@gmail.com	\N	\N	\N	NONE	f	2024-12-03 16:50:12.73	2024-12-03 16:50:12.73	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	698751	\N	\N	\N
7f140d40-53a4-4532-a9fd-433f5e0c41fe	Ram	Ram	\N	$2b$10$mqXEbMuFRF/QuVl4zSwqau0h27aOOZjNTUa4NTPlgDq567cCiAN4W	reeam@gmail.com	\N	\N	\N	NONE	f	2024-12-03 16:59:28.429	2024-12-03 16:59:28.429	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	4561324222
64c4c5b8-b321-4453-b0c6-98a11f739d84	Walid Harambe	Walid Harambe	fpVila7FTLm9K8UtcFn0DO:APA91bEv3Tr5AWCrAeJ-OKHcneBwBO6fx_nP98Ef5qFZo5xnN6JB2yrefdZJxJqcOL0gM5mRnNpxPnYki_h6PeqQE63IJtr7lCPgZW-PcFCp2F-reJOKJAc	\N	oualid318779@gmail.com	\N	\N	\N	GOOGLE	f	2024-12-18 15:00:09.285	2024-12-18 15:00:09.285	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	114601602303692154673	\N
7aa1e66a-1ee9-40b5-94d3-d5c5a20bc642	New Agency	Agency	\N	$2b$10$z1/M4fmgQRlbv96HFrlgCeWIcDDTw0ExAfBU02uTWriIHNAt9MBWe	agency1@gmail.com	\N	\N	\N	NONE	f	2024-12-03 17:20:19.011	2024-12-03 17:20:19.011	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1234567892
d2ce11b2-1280-48e9-a59d-360ab48f34f4	\N	\N	\N	\N	dabhiisha815@gmail.com	\N	\N	\N	NONE	f	2024-12-10 12:50:25.7	2024-12-10 12:50:25.7	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	163257	\N	\N	\N
5f2337cc-f68f-4f13-abe1-7da990ba3112	summeey	summeey	dR6Pu5s1RLG3eLypNYtuRs:APA91bFWxAo3MdwEC-huZ-lcNeeWnFzkOH6PRaFaT13GLv7NAP-EYeeQRAz3NFMXFHppD8b9lH9CDWL60q_CCbiZeEb-6PwBWwqydbag1cjEMfaUFb4HSGM	$2b$10$MKRFF8J3SSgah4nrDf3YL.KeyMMuJFUzQhvgnVuS6Z3MxAJIYwDRe	dabhiisha8156@gmail.com	\N	\N	\N	NONE	f	2024-12-11 16:58:25.981	2024-12-11 16:58:25.981	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	702097	\N	\N	9996663332
31950c69-b8bb-4de8-bfb3-05c1a20fcf1a	Vijay	Vijay	\N	$2b$10$HO30cvJgJsKpNpfozfgQjOixQZBePh.lkvEkdQsezSKprI1MWlDDe	vijay_patel@gmail.com	\N	\N	https://api.immofind.ma/uploads/portrait-happy-woman-pride-office-confident-project-manager-engineering-agency-face-businesswoman-design-business-293808304.webp	NONE	f	2024-12-16 10:59:48.018	2024-12-16 10:59:48.018	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1234578978
3fae7aee-af61-491c-8f2a-9de259d64f97	New Developer	Developer	\N	$2b$10$eg6Zp16dBM.oiGnVChDWFOwk8v3R6mSwZ24oHhAG2fWo8SBhGkOHi	developer1@gmail.com	\N	\N	\N	NONE	f	2024-12-03 17:21:08.976	2024-12-03 17:21:08.976	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1234567895
e8fa15cc-f5e9-4ed4-8000-0bd83ee2c903	Sumit Bhut	Sumit Bhut	cMJAGq88S_Sbpuhs0Usen1:APA91bHNblipa-B5A4AaebhGhOV14DHcn4bsIBNNmYa-x9L6S1xSmKB7Gw0adHlgLdPnbWHPh6Uadey-aoWiMIkY2VVBsAvX9EODsCdR1nWmGtP8uiY3F7U	\N	sumit00779@gmail.con	\N	\N	\N	FACEBOOK	f	2024-12-05 03:54:32.697	2024-12-05 03:54:32.697	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	8987748321281573	\N
ef41209b-1a3e-4f13-ac9a-26bb9ca627ef	Sumeet Bhut	Sumeet Bhut	cMJAGq88S_Sbpuhs0Usen1:APA91bHNblipa-B5A4AaebhGhOV14DHcn4bsIBNNmYa-x9L6S1xSmKB7Gw0adHlgLdPnbWHPh6Uadey-aoWiMIkY2VVBsAvX9EODsCdR1nWmGtP8uiY3F7U	\N	sumeetbhut9@gmail.com	\N	\N	\N	GOOGLE	f	2024-12-05 03:58:08.38	2024-12-05 03:58:08.38	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	110053636369863286198	\N
a154fb82-216a-4976-b2a6-f52035243bc7	Eagle arjun	Eagle arjun	fPJz6gwbTd2h5vHCv5btAb:APA91bG0RkOa-Oj1eg9j-rmrWQusgS2FScLpSKJ22IwZ-EnToIR7JfN4-uwjTNT-1VthQJNK-v6EKrN1L7n5-BqQXJAPhVy11ezuIlEl5LtFznvKEm2-Iag	$2b$10$luWnIpA1NWODqHGSoVYP1OXm52RfJukj.Y4ctxacTX1QrU4FO/KCy	eagdle@gmail.com	\N	\N	\N	NONE	f	2024-12-03 18:05:10.276	2024-12-03 18:05:10.276	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	1234567856
80c50f20-3388-46d6-9a83-e4b5c1ff61dc	Eagle Psyel	Eagle Psyel	fPJz6gwbTd2h5vHCv5btAb:APA91bG0RkOa-Oj1eg9j-rmrWQusgS2FScLpSKJ22IwZ-EnToIR7JfN4-uwjTNT-1VthQJNK-v6EKrN1L7n5-BqQXJAPhVy11ezuIlEl5LtFznvKEm2-Iag	$2b$10$JSdVCLuH1AkQjrKNZd7VpemRqpsq7Z8PalIyk.oUGg/sQoMttibIS	eagle13@gmail.com	\N	\N	\N	NONE	f	2024-12-03 18:05:55.771	2024-12-03 18:05:55.771	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	400584	\N	\N	1122334455
a1eac073-32f1-4784-83c1-f46ada889615	Samsung M13 Tab	Samsung M13 Tab	d6Sp-KxsRXOCpbPx9lUumk:APA91bHOq938FdNe9Wq_LwL09AeW9uamqSXTbWL3bqYA4w47Pk8cLvLrIx30R8OIQv8TUOSxl-lQpLleW4rfCdStkmhr2fxhugkid6UgJzi9-8y6Zip6Uss	\N	samsungm13initiotechmedia@gmail.com	\N	\N	\N	GOOGLE	f	2024-12-06 05:12:31.568	2024-12-06 05:12:31.568	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	690032	\N	112837045918731841334	\N
51a80844-c5ef-4433-b0e3-82df9ce8d535	Agency	Agency	\N	$2b$10$5Jt7hbxhr39EujJ2plQnuOzr9nvasY03YtxUCTBufxF87OY61w0X6	agency12@gmail.com	\N	\N	https://api.immofind.ma/uploads/logo_rk_consulting.jpg	NONE	f	2024-12-04 07:38:18.858	2024-12-04 07:38:18.858	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1231231233
5e2155ae-067a-4f49-9c12-60910d342b9f	Agency	Agency	\N	$2b$10$OqFPOcdfxDRF59Sm6XyTz.rNYyp0CYTkNTCiSx22dMXAkGIUjkxaK	agency123@gmail.com	\N	\N	https://api.immofind.ma/uploads/logo_rk_consulting.jpg	NONE	f	2024-12-04 07:42:46.876	2024-12-04 07:42:46.876	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1231231222
7fbea6cb-5de5-4a36-9107-85b4b8dfc928	123	123	\N	$2b$10$YFy44NSaI4bBTWOaStlUwefAXOjvk9JvtdRdOCGJWh1ZuFM9wPqZ2	123456@gmail.com	\N	\N	\N	NONE	f	2024-12-06 09:45:27.354	2024-12-06 09:45:27.354	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	1234567000
9720824f-f492-4d8f-a694-d9ceff8ef21e	Shruti Patel	Shruti Patel	eUj5BfjuSDm8CTU8IcMu7k:APA91bFPOqH3H8uxvH0kKxvzMYUkXNuYCz2HmWSegGBxAseSEPUoCeugRygx4ukIu7q4wQaZGrxKXj9oWKxENheIGtQmb1AU6pTi9v-br28z0RuIZFZbiRo	\N	shrutipatel221290@gmail.com	\N	\N	\N	GOOGLE	f	2024-12-06 12:04:26.514	2024-12-06 12:04:26.514	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	100607476782838342434	\N
9f7325db-8b97-437c-b7e0-db9b204ba2bf	34qe	34qe	\N	$2b$10$qI3JIRn9kHsOLJhnKD3K9O9aTaiZqvN/NUchlLxFx5wbJ02YTKkcS	2sssss34@gmail.com	\N	\N	https://api.immofind.ma/uploads/logo_rk_consulting.jpg	NONE	f	2024-12-04 11:39:07.471	2024-12-04 11:39:07.471	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1231232341
9ba589b5-54b0-4a29-87eb-a4981b59680a	Raj 	Raj 	\N	$2b$10$Bd7MUilErjV9gbrwRosaJOrxFuYAiYu8orAI82BOW1V0zMNN52nv2	raj@gmail.com	\N	\N	\N	NONE	f	2024-12-04 11:43:04.666	2024-12-04 11:43:04.666	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1231233456
2dd4d602-9f98-471f-93b9-4eac06c87f6f	345	345	\N	$2b$10$0WAT1xbSb9PFv1sjlT/cDuBEeBQKvqohVDohvKKRRvhXJY8QL4WiK	345@gmail.com	\N	\N	\N	NONE	f	2024-12-04 11:47:37.967	2024-12-04 11:47:37.967	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1231233424
9f026603-bf39-4286-9b16-75986c127ac3	yui	yui	\N	$2b$10$BfNJIm8ITKOQDi1VnqfPveFXCohBtYMcxGjJFjH4UBReLKW.f04QS	yui@gmail.com	\N	\N	\N	NONE	f	2024-12-04 11:49:27.184	2024-12-04 11:49:27.184	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1231231232
30aabce9-4a05-4afb-afb8-1f1c6f0dda21	Joseph Denial 	Denial	\N	$2b$10$.nr.5r7UZ.jpKA0E/fhFQeho6QtcpnTSbeUsRCZADMIc3t24XawIe	denial1@gmail.com	\N	\N	https://api.immofind.ma/uploads/denial.png	NONE	f	2024-12-11 17:01:41.751	2024-12-11 17:01:41.751	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	253344	\N	\N	4654564568
24d25b76-221e-4579-b4a4-3d6a4b187143	Joseph Denial 	Denial	\N	$2b$10$vwBrwGi2CJa.7eUbWN3W2eEQGzZaMi3XKHx3Yn/MqphbWqtiL7EVe	denial3@gmail.com	\N	\N	https://api.immofind.ma/uploads/denial.png	NONE	f	2024-12-11 17:03:14.061	2024-12-11 17:03:14.061	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	4654534268
7ad46579-7906-4571-9ed8-e9b84a9c148c	Rk Agency	RK	\N	$2b$10$Pg6wnJr5l4jbwVWxZu1Cl.OpyX8CCTRhhrxdp5wTtfPJVSix7rAbS	rk_agency@gmail.com	\N	\N	https://api.immofind.ma/uploads/logo_rk_consulting.jpg	NONE	f	2024-12-12 05:41:32.304	2024-12-12 05:41:32.304	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1111111111
6f15a8b5-f062-4606-b663-e7c320135e2e	Royal construction	Royal	\N	$2b$10$bif75WYNWBYv5EiAC6pzl.3a002KkqBME/1X1NwO8oOFxT3Ip5Uv2	royal_construction@gmail.com	\N	\N	https://api.immofind.ma/uploads/royal_construction.png	NONE	f	2024-12-12 05:40:31.55	2024-12-12 05:40:31.55	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	8888888888
f16cbfc3-790f-4da1-90e4-35a8c51324fe	Developer Group	Developer Group	\N	$2b$10$yQ6VbkrZccly.mrm9eVpT.e1fD78TXVZISL6LtfSQIZqvfTUhxz6G	developer_grodup@gmail.com	\N	\N	https://api.immofind.ma/uploads/genenrate-photorealistic-image-wesley-judge-260nw-2517053981.webp	NONE	f	2024-12-16 10:48:31.931	2024-12-16 10:48:31.931	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1234568525
28188641-3f18-420a-8ba0-a050ad15fc14	\N	\N	\N	\N	rk_agnecy@gmail.com	\N	\N	\N	NONE	f	2024-12-16 13:51:10.998	2024-12-16 13:51:10.998	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	522989	\N	\N	\N
42f79627-85c4-4970-b82e-906480bf2c1e	\N	\N	\N	\N	meet190@gmail.com	\N	\N	\N	NONE	f	2024-12-06 05:51:00.452	2024-12-06 05:51:00.452	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	203019	\N	\N	\N
e6c2cce8-1bee-42e6-a127-13410cc4311d	Rohan Faladu	Rohan	EAA0SIgCahCQBO0rVA8Yg5bMEOBx3ijW72dXpI8rkTP0mdUtlC73JnLESZBAVLU6iTZCfSROk9QaxXLFbGFG7pjozCvSNxxg59PA6zXvNR6lvlCjIXzXOWRCZAW1pjIBlyKgVnFYxub2Vjv6tTgHJEok7pGwZCd3dmyRThrJZC7OzcgCBVYMaZAdzZBgtZBvIANitWNU7fSACB1cUzltfAQZDZD	$2b$10$OU9ff7qgCMo/vg7HKNMP5OuF.Sin5PcYdCysolR7vSZYgPnqfdToe	faldurohan1991@gmail.com	\N	796572	https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=8552276138204198&height=50&width=50&ext=1735913151&hash=Abbf5O-szICXaJQZbsblr-Uo	FACEBOOK	f	2024-12-04 14:05:52.506	2024-12-04 14:05:52.506	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	8552276138204198	\N
1437cdbe-fa60-417e-b3ac-bc6771f84370	agencyoualid@gmail.com	agencyoualid@gmail.com	\N	$2b$10$k4rrFKUIGWadqsjq2U1/sOJSf038Fd17fDveyzRBrUWuGNnzlfw.W	agencyoualid@gmail.com	\N	\N	\N	NONE	f	2024-12-05 13:52:47.63	2024-12-05 13:52:47.63	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	7878787878
380de3e7-2e97-4186-b1fe-cfe14288c3c4	\N	\N	\N	\N	sumit007799@yahoo.com	\N	\N	\N	NONE	f	2024-12-06 11:01:29.453	2024-12-06 11:01:29.453	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	584707	\N	\N	\N
e7bf9851-0af5-4aae-8702-8cdcdbb5479b	Sumeet	Sumeet	cTRKZYpqS8yDTHLwEmH-ea:APA91bG_UJVTftc3BJ5X1wBv07i16rjFSumtm1NjMymKeg7-vdTpzQxyZUBMhHktCtvLBlH_tj0X1uUXQiHw9QqldShNdOsHsfjJlRIDURW3FqGrxuwW7vw	\N	motoonepower01@gmail.com	\N	\N	\N	GOOGLE	f	2024-12-06 12:09:43.757	2024-12-06 12:09:43.757	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	102729038632470627873	\N
5aa13d9e-2b0e-48da-bfa3-21f05c010bae	wwerwer	wwerwer	\N	$2b$10$tyfRl7lSWO4Y1bwvOIzyiuQu2Zow.wCi/XOFdx9xBVpL0xugCtgSu	wwwwwwwwww@gmail.com	\N	\N	https://api.immofind.ma/uploads/download.jpeg	NONE	t	2024-12-04 13:30:57.608	2024-12-04 13:30:57.608	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	2342342422
32a0a27b-efd4-48d3-a2fd-899e84708d54	Swastik Group	Swastik	eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjOGEyMGFmN2ZjOThmOTdmNDRiMTQyYjRkNWQwODg0ZWIwOTM3YzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYxNDQ3MjUzMzA0NTA0MTAxNzMiLCJlbWFpbCI6InBhdGVscm9oYW4yNjE5OTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTczMzMxNDQ4OSwibmFtZSI6IlJvaGFuIFBhdGVsIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0l6bWhBSGUyRHhhbHVVaExQaW5kM0wtR1lJcG90elF2SjlCVndLMy1LdFFfNURCQT1zOTYtYyIsImdpdmVuX25hbWUiOiJSb2hhbiIsImZhbWlseV9uYW1lIjoiUGF0ZWwiLCJpYXQiOjE3MzMzMTQ3ODksImV4cCI6MTczMzMxODM4OSwianRpIjoiOWIxZDQ2NmNjM2E1Mzk1NTJiNWQ1MzQ5ZThlYmI2OWRiODQ4ZTk0MSJ9.VzVZ7ortMgeGSuvWzdbkya8mNC67UiuwWd5rQkCun_0sTBz8AkcW4hI98wltO1IRXP2DP-acUZoZXABIf4ObQxPciporxUWST5V0k3AiXMy4foWcrsmHq6ZEMABNhNwCyPpolDMiD7tr0jUoLVh8GF4t_KWAB2_VC1FH_XWEOEP31zClqhKA-6Ed_jL9a6TTxf0isvQJ8rzzb-MyGRzQ7mMPDFsBx0bwX6YjYh_1Yg3xNfK2gf_BGPwdFpo3hzhCWJl58jAxuDMmDbC9K5ioUiGwez3h1gpwmE7Fo8zVRgH-q_CCgyOOc7DzpG3t71iORTh_81b9ljtr3zPUgK3f-A	$2b$10$J5qKMrIx/95FIAVmQNE9XuO4yg4LZSLUshKoIoB/rJ8o9DB83NIkG	swatik@gmail.com	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIzmhAHe2DxaluUhLPind3L-GYIpotzQvJ9BVwK3-KtQ_5DBA=s96-c	NONE	f	2024-12-09 10:20:33.478	2024-12-09 10:20:33.478	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1230987654
9e5f3be8-93ea-45ad-b427-a8f723aecf5d	New Agency Developer	New Agency Developer	\N	$2b$10$F3usCjYHBAmOuRYWKBjp2u2nVipJ4tZZnH0.ND8CxL9oG0dg2v4Li	new_agency@gmail.com	\N	\N	\N	NONE	f	2024-12-04 12:16:39.868	2024-12-04 12:16:39.868	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1234678822
204cb541-e30c-4b3d-90f5-3872a68ca601	Rohan Patel	Rohan	eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjOGEyMGFmN2ZjOThmOTdmNDRiMTQyYjRkNWQwODg0ZWIwOTM3YzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYxNDQ3MjUzMzA0NTA0MTAxNzMiLCJlbWFpbCI6InBhdGVscm9oYW4yNjE5OTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTczMzMxNDQ4OSwibmFtZSI6IlJvaGFuIFBhdGVsIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0l6bWhBSGUyRHhhbHVVaExQaW5kM0wtR1lJcG90elF2SjlCVndLMy1LdFFfNURCQT1zOTYtYyIsImdpdmVuX25hbWUiOiJSb2hhbiIsImZhbWlseV9uYW1lIjoiUGF0ZWwiLCJpYXQiOjE3MzMzMTQ3ODksImV4cCI6MTczMzMxODM4OSwianRpIjoiOWIxZDQ2NmNjM2E1Mzk1NTJiNWQ1MzQ5ZThlYmI2OWRiODQ4ZTk0MSJ9.VzVZ7ortMgeGSuvWzdbkya8mNC67UiuwWd5rQkCun_0sTBz8AkcW4hI98wltO1IRXP2DP-acUZoZXABIf4ObQxPciporxUWST5V0k3AiXMy4foWcrsmHq6ZEMABNhNwCyPpolDMiD7tr0jUoLVh8GF4t_KWAB2_VC1FH_XWEOEP31zClqhKA-6Ed_jL9a6TTxf0isvQJ8rzzb-MyGRzQ7mMPDFsBx0bwX6YjYh_1Yg3xNfK2gf_BGPwdFpo3hzhCWJl58jAxuDMmDbC9K5ioUiGwez3h1gpwmE7Fo8zVRgH-q_CCgyOOc7DzpG3t71iORTh_81b9ljtr3zPUgK3f-A	$2b$10$rSMxB7DI6dVMNRhrQKLGfeprTsRvPG55XzzRd2kQw5Ygg7.Aa8RIC	patelrohan261992@gmail.com	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIzmhAHe2DxaluUhLPind3L-GYIpotzQvJ9BVwK3-KtQ_5DBA=s96-c	GOOGLE	f	2024-12-04 12:22:06.492	2024-12-04 12:22:06.492	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	106144725330450410173	0
0e20c141-a885-46dd-ad06-e23efc25ad4d	eeeeeeeee	eeeeeeeee	\N	$2b$10$COd1Ol0.O/48fbTIcz92ceI4U2l852.ea9iY9putc/uN2LIfatUDO	rrrr22222@gmail.com	\N	\N	https://api.immofind.ma/uploads/Picture18.png	NONE	f	2024-12-04 13:25:40.663	2024-12-04 13:25:40.663	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	6666666666
7392a9c7-a2c8-4e4c-abcf-39f9e4001df8	Oualid test user	Oualid test user	\N	$2b$10$sHzuG8GUyAQ4Fo0eMcagROr7jH3absQ9qn.VkQ16gmLAUfacQAuQS	useroualid@gmail.com	\N	\N	\N	NONE	f	2024-12-05 19:42:00.164	2024-12-05 19:42:00.164	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	5511223366
8c220a15-ae46-4f01-ab84-50df377bf3d9	OualidTest	OualidTest	\N	$2b$10$DACYHvnm0yK00QStNDn1o.1wYHjWbnlNotkctO75POzK0S/4Z5gG2	test@gmail.com	\N	\N	\N	NONE	f	2024-12-05 19:42:41.189	2024-12-05 19:42:41.189	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	578964132
286c4c4c-59ee-4413-a9f5-331ebe5c33bb	developer123	developer123	dR6Pu5s1RLG3eLypNYtuRs:APA91bFWxAo3MdwEC-huZ-lcNeeWnFzkOH6PRaFaT13GLv7NAP-EYeeQRAz3NFMXFHppD8b9lH9CDWL60q_CCbiZeEb-6PwBWwqydbag1cjEMfaUFb4HSGM	$2b$10$e1qAREkG4N8J3CAyBLkUNORfkpNWdzDGGGSwvHpof.RurwHkgZAsq	developer123@gmail.com	\N	\N	\N	NONE	f	2024-12-11 06:51:16.049	2024-12-11 06:51:16.049	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	754132	\N	\N	2580963147
11ab18ce-8c2c-4688-b59c-c92a779334fd	\N	\N	\N	\N	royal_constrution@gmail.com	\N	\N	\N	NONE	f	2024-12-12 05:46:30.074	2024-12-12 05:46:30.074	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	602591	\N	\N	\N
1359dd6c-aab1-4f04-a5cd-136b03921f60	Royal	Royal	\N	$2b$10$rZnRauwFHSxmPjOiJ7Q2puFPITbt4gLdUKR8cnir47K27JgSjIGru	royal_builder@gmail.com	\N	\N	https://api.immofind.ma/uploads/authentic-small-youthful-marketing-agency.jpg	NONE	f	2024-12-16 10:53:45.161	2024-12-16 10:53:45.161	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1234565283
c647b53a-dd7d-4c08-9e93-7224f1169bae	\N	\N	\N	\N	royal_conqtruction@gmail.com	\N	\N	\N	NONE	f	2024-12-17 19:04:14.154	2024-12-17 19:04:14.154	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	582481	\N	\N	\N
9574170c-4169-446e-9e46-a318969176a1	Vinish	Vinish	eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjOGEyMGFmN2ZjOThmOTdmNDRiMTQyYjRkNWQwODg0ZWIwOTM3YzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDkxMzU4MzY0NDIzOTI4MjEzNjciLCJlbWFpbCI6Imh5YWt1ZGV2MDAxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3MzMzMjMxMTEsIm5hbWUiOiJWaW5pc2giLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSzNDaTU1VDlRME9qWVhoSjJrSVNPNEVWQkpGa2F5SVpNNll2c3RQUVBUcVAxX0JXST1zOTYtYyIsImdpdmVuX25hbWUiOiJWaW5pc2giLCJpYXQiOjE3MzMzMjM0MTEsImV4cCI6MTczMzMyNzAxMSwianRpIjoiMGVmYTIxNDQwNjQ2NTQyOTcxZmQwNzUxY2VmZGQ4OTAxZDA1YzhiOSJ9.MhAjibHvDso5GjUWKpPYc9iRtBoWVzpiGZQhpgoS930r3-wltVLcrdO7QBX010lCF5QmjgcJ7_T-mponmsH5ZYWxbH4RL3CNpbM2xOef9K6YBBO0C0WafPmmc2PQwYABvWl383nQxcthhB5mqC71KyzXxBB_6h_r2gg5ZoVWvofqKu7e1tFden75HJegXwJrHoZhuSyGT7UFnjNTlZ3TNVovbb0z7DhcC0Uwr5YSwnpI1vYvOBYxLEzpXGOs1rrJHRv5UvTL2H_E6m2cDyGdL0vc0RZp0z0I_fIXDb6zu732qDL28RhIQd49Igcmzh-H3Imd-sogvpYaxLOEMLqVpg	\N	hyakudev001@gmail.com	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocK3Ci55T9Q0OjYXhJ2kISO4EVBJFkayIZM6YvstPQPTqP1_BWI=s96-c	GOOGLE	f	2024-12-04 14:43:33.111	2024-12-04 14:43:33.111	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	109135836442392821367	\N
b3807af8-5b04-465d-827e-996f5d2a7e61	ad	ad	\N	$2b$10$JV.hBxlh4blWFf2hUkSVTeRRl.iYh/p91kFR4TkDKJCHpyGTn5A.K	h.adil23@icloud.com	\N	\N	\N	NONE	f	2024-12-04 15:54:15.261	2024-12-04 15:54:15.261	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	992494	\N	\N	674106566
cbd54829-67f1-40a3-8039-fb434522c447	\N	\N	\N	\N	shivani@gmail.com	\N	\N	\N	NONE	f	2024-12-06 06:16:10.494	2024-12-06 06:16:10.494	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	327290	\N	\N	\N
29f7ff03-1d17-4762-a417-472f3040f624	\N	\N	\N	\N	foram@gmail.com	\N	\N	\N	NONE	f	2024-12-06 11:16:38.948	2024-12-06 11:16:38.948	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	576289	\N	\N	\N
8694b20e-043b-4b84-ae35-cf21a1b59902	testoualid1	testoualid1	\N	$2b$10$eXdu0.R0jzz3u9KifDiA6epo2IZRSDMe5lfUn48D5WB4zXXBJqRFu	testoualid1@gmail.com	\N	\N	\N	NONE	f	2024-12-07 15:50:38.291	2024-12-07 15:50:38.291	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	123456789
1b57c369-1865-4470-9e69-78f603885ad7	testoualid1@gmail.com	testoualid1@gmail.com	\N	$2b$10$ZmISswExkNXorxtvugnkFuHqb2msm9tO/rMB.2.4aYg7z0iFvRRXC	testoualid2@gmail.com	\N	\N	\N	NONE	f	2024-12-07 15:51:43.522	2024-12-07 15:51:43.522	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	1122332233
b020565c-919d-4c01-98af-39a9059d1ab9	Test test	Test test	fb4ZPHNFSpah_IDjLjAU2l:APA91bE3hU3mvEmMPDjOwrL4UuKOsAumI4HBlN21n90Npwap0-bbf2KpZjbZojo189xPa9A4cxOcoeDoOX676z-_qhkqa13zDS48g1Kxk3G62RvD0osduJs	$2b$10$ZpKCpI5Vpj3yhYAv9GTasOziRURjaALDXHpS0zroXzaJzA122oXYm	test12345@gmail.com	\N	\N	https://api.immofind.ma/uploads/scaled_1000000608.jpg	NONE	f	2024-12-04 15:35:07.803	2024-12-04 15:35:07.803	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	783220	\N	\N	1122334466
0dbaf0fc-ee80-4fed-a729-153f66737248	newUser	newUser	\N	$2b$10$D2xXmq91JgkTZAX4or6RQuDR1isLWqK.4oZw7jKqZ4ZrItFRAFuFm	newuser@gmail.com	\N	\N	\N	NONE	f	2024-12-04 15:37:31.215	2024-12-04 15:37:31.215	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	1230984562
81b021d9-0e70-4ff2-ab90-bbc06d561589	Shital Patel	Shital Patel	fb4ZPHNFSpah_IDjLjAU2l:APA91bE3hU3mvEmMPDjOwrL4UuKOsAumI4HBlN21n90Npwap0-bbf2KpZjbZojo189xPa9A4cxOcoeDoOX676z-_qhkqa13zDS48g1Kxk3G62RvD0osduJs	\N	shitalpatel262@outlook.com	\N	\N	\N	FACEBOOK	f	2024-12-04 15:37:37.58	2024-12-04 15:37:37.58	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	1308576746801620	\N
2873702b-9f9d-4183-8612-d93a2b2f3aca	\N	\N	\N	\N	test1234@gmail.com	\N	396328	\N	NONE	f	2024-12-04 15:29:54.684	2024-12-04 15:29:54.684	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	751133	\N	\N	\N
3058dc09-3953-4658-9f85-339db3bed527	rajubhai	rajubhai	\N	$2b$10$flZ9UFM2J/VZ1Z32DqV5KO3lj/9cDpardbT.11Kz5IWm/Myoxr3i2	rajubhai@gmail.com	\N	\N	\N	NONE	f	2024-12-04 15:42:48.53	2024-12-04 15:42:48.53	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	1230987345
f5a54586-332e-4557-8ce4-6733b2309c25	oualid07elhasnaoui	oualid07elhasnaoui	\N	$2b$10$WgRfJKKfz.nov.L.aqqBIO/hRXs2I0CCmnd6zJFbWWv6kGsRODFGa	oualid0elhasnaoui@gmail.com	\N	\N	\N	NONE	t	2024-12-04 16:00:41.009	2024-12-04 16:00:41.009	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	11223344
c3e706d5-bdc7-4c68-b812-48eb23f0c22d	Developer 234	Developer 234	\N	$2b$10$ktwasZP3JvojOovUwpFl4.zmHWq5V.5SPT3oY/CJvrxecJVSXZnKe	developer234@gmail.com	\N	\N	\N	NONE	t	2024-12-04 15:20:54.695	2024-12-04 15:20:54.695	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	2333333333
dde26662-0b72-424c-8a17-b852bcd678e5	\N	\N	\N	\N	Adilhanafi23@gmail.com	\N	\N	\N	NONE	f	2024-12-04 16:08:06.349	2024-12-04 16:08:06.349	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	610456	\N	\N	\N
3e903f93-f1b3-447d-98a1-de9ec83a43e8	Agency	Agency	\N	$2b$10$CYnXKmRoZcbXO/1BIIsnvevUA.v2X58fsn3EkNudTdZjvAKTR/mt6	newcreateagency@gmail.com	\N	\N	https://api.immofind.ma/uploads/agency.webp	NONE	f	2024-12-16 08:06:17.478	2024-12-16 08:06:17.478	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1234565555
1705bd57-f251-4299-91c5-f36c126acbd1	oualid07elh	oualid07elh	\N	$2b$10$mKFib7TMhV.6Z2LAnf.5ruG69V7B46M/8i2B0PKeCsUrNXvKeUsZu	oualid.elhasnaoui.pro@gmail.com	\N	\N	\N	NONE	t	2024-12-04 16:03:55.309	2024-12-04 16:03:55.309	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1234567890
9def921d-9136-445c-b789-ffde81b89424	admin	admin	\N	$2b$10$eYCzB.6TnptLAN3/TzOTC.HLlt1dIp.77miruOjZUCYhuGP3CJrN.	agency13@gmail.com	\N	\N	\N	NONE	t	2024-12-04 15:16:23.808	2024-12-04 15:16:23.808	c326e1e2-6f82-4af4-ba25-06029eba6569	t	\N	\N	\N	\N	1233451233
b349384b-6fc3-4908-8c65-6a8c1be10e6f	Sumeet	Sumeet	cMJAGq88S_Sbpuhs0Usen1:APA91bHNblipa-B5A4AaebhGhOV14DHcn4bsIBNNmYa-x9L6S1xSmKB7Gw0adHlgLdPnbWHPh6Uadey-aoWiMIkY2VVBsAvX9EODsCdR1nWmGtP8uiY3F7U	$2b$10$pL7c4/cTNbYHeozaZlb4t.x/rOUtiH3gA5Ga089Pi0QroPriUAIcG	sumeetbhut@gmail.com	\N	\N	\N	NONE	f	2024-12-04 15:19:50.521	2024-12-04 15:19:50.521	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	933169	\N	\N	1122338899
e1e62e89-23cb-4636-850d-5b28dd873724	developer3	developer3	\N	$2b$10$24X0K7r/GTz8UrVrtNq90utxPww.a3OtU9DMSXj/Au6Z8FPzIaGxC	developer3@gmail.com	\N	\N	\N	NONE	t	2024-12-04 16:53:23.152	2024-12-04 16:53:23.152	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1111111111
fe1d6d0d-ed3a-4b31-953a-a275bbfecee0	developer	developer	\N	$2b$10$UJfNS8zTDInbBgaoEceYvun3wUk0TD.F71BWDW7BKsNe0q9pX3ksy	developer09@gmail.com	\N	\N	\N	NONE	f	2024-12-11 09:08:39.528	2024-12-11 09:08:39.528	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	987654321
e853ede7-bab5-4746-807a-e46cb3f28171	Joseph Denial 	Denial	\N	$2b$10$3jDIJFf.2cXEXjHGgP1ex./FT6jcVdhZcszmMpBB70VeOZqYNWX56	denial@gmail.com	\N	\N	https://api.immofind.ma/uploads/denial.png	NONE	f	2024-12-10 05:11:57.709	2024-12-10 05:11:57.709	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	783613	\N	\N	8238561456
8ed452e9-ea00-435d-8624-9b238867125f	\N	\N	\N	\N	agency97@gmail.com	\N	\N	\N	NONE	f	2024-12-12 05:16:36.7	2024-12-12 05:16:36.7	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	958875	\N	\N	\N
0c03e72a-1d70-4e00-8c39-23f0ae96f6a5	Developer	Developer	\N	$2b$10$z1Fev3oc5bGTv.OJZLX7vOr9ECzuBGPvUxwCgnRPXdWzfNvE/vpcq	newcreatedeveloper@gmail.com	\N	\N	https://api.immofind.ma/uploads/developer.webp	NONE	f	2024-12-16 08:08:36.463	2024-12-16 08:08:36.463	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1235555555
3279c014-e026-4180-82e1-cff2b2e97c0f	Developer	Developer	\N	$2b$10$QM7KyAUnEKRBnom3RaBxMueJhrZwha2zKVf2VtPanxeoWxY220Bnm	latestcreatedeveloper@gmail.com	\N	\N	https://api.immofind.ma/uploads/developer.webp	NONE	f	2024-12-16 08:09:53.308	2024-12-16 08:09:53.308	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1235555665
84ea5152-34aa-43c2-8cde-2748c0b6b2e0	Royal	Royal	\N	$2b$10$YKTdOUIbQdg8kCOJtdfm/uhnuBoIs1HliunVq1moLkZ/fLf59nNcC	royal_buidddlder@gmail.com	\N	\N	https://api.immofind.ma/uploads/authentic-small-youthful-marketing-agency.jpg	NONE	f	2024-12-16 10:56:44.975	2024-12-16 10:56:44.975	c326e1e2-6f82-4af4-ba25-06029eba688f	t	\N	\N	\N	\N	1234345283
acab4a4c-313c-49d2-83e6-da6fee47e744	Oualid	Oualid	\N	$2b$10$3DGbuzgYkTI4uB58ZVNSAe.jz78VkzBDj26y.UQF6Bfpi2iJJNpNC	useroualid11@gmail.com	\N	\N	\N	NONE	f	2024-12-18 14:07:36.993	2024-12-18 14:07:36.993	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	918513	\N	\N	616234862
75155f33-6488-4c4f-b0af-2ec7615e868c	Rohan Patel	Rohan	eyJhbGciOiJSUzI1NiIsImtpZCI6IjJjOGEyMGFmN2ZjOThmOTdmNDRiMTQyYjRkNWQwODg0ZWIwOTM3YzQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNDAzMzUyNDA4ODEtanZzOW0wNG5mb2YxbXFvcG5ubDNobGFjM3QzczVkOGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDYxNDQ3MjUzMzA0NTA0MTAxNzMiLCJlbWFpbCI6InBhdGVscm9oYW4yNjE5OTJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5iZiI6MTczMzMxNDQ4OSwibmFtZSI6IlJvaGFuIFBhdGVsIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0l6bWhBSGUyRHhhbHVVaExQaW5kM0wtR1lJcG90elF2SjlCVndLMy1LdFFfNURCQT1zOTYtYyIsImdpdmVuX25hbWUiOiJSb2hhbiIsImZhbWlseV9uYW1lIjoiUGF0ZWwiLCJpYXQiOjE3MzMzMTQ3ODksImV4cCI6MTczMzMxODM4OSwianRpIjoiOWIxZDQ2NmNjM2E1Mzk1NTJiNWQ1MzQ5ZThlYmI2OWRiODQ4ZTk0MSJ9.VzVZ7ortMgeGSuvWzdbkya8mNC67UiuwWd5rQkCun_0sTBz8AkcW4hI98wltO1IRXP2DP-acUZoZXABIf4ObQxPciporxUWST5V0k3AiXMy4foWcrsmHq6ZEMABNhNwCyPpolDMiD7tr0jUoLVh8GF4t_KWAB2_VC1FH_XWEOEP31zClqhKA-6Ed_jL9a6TTxf0isvQJ8rzzb-MyGRzQ7mMPDFsBx0bwX6YjYh_1Yg3xNfK2gf_BGPwdFpo3hzhCWJl58jAxuDMmDbC9K5ioUiGwez3h1gpwmE7Fo8zVRgH-q_CCgyOOc7DzpG3t71iORTh_81b9ljtr3zPUgK3f-A	$2b$10$fdhZ2.80qGe0vn.pEMv2CuAxuAID9GGCkJ7ifHreR3mZ6wRjmX14K	patelrohddan261992@gmail.com	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocIzmhAHe2DxaluUhLPind3L-GYIpotzQvJ9BVwK3-KtQ_5DBA=s96-c	NONE	f	2024-12-09 10:19:04.846	2024-12-09 10:19:04.846	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	422741	\N	\N	4354434534
bbc26e46-ae69-4cbb-8cb8-404bfeeee4ee	Test Deven	test	\N	$2b$10$QnWJ1Z8rVM3z/wUnwINsfOZqdAGsgcMUo1zV9iEWMPFiciNOwxFky	uday@gmail.com	\N	\N	\N	NONE	f	2024-12-24 08:30:15.932	2024-12-24 08:30:15.932	c326e1e2-6f82-4af4-ba25-06029eba688f	t	+91	427458	\N	\N	8347676869
c3bcbd87-aa5a-4634-b37c-1447a7702aeb	Test Deven	test	\N	$2b$10$Y14VyyYAtbx8kAoi4ZuqMu.DY0PxI7ONKqIEITIHeNpeVvFjZopU.	uday123@gmail.com	\N	\N	\N	NONE	f	2024-12-24 13:00:48.357	2024-12-24 13:00:48.357	c326e1e2-6f82-4af4-ba25-06029eba688f	t	+92	\N	\N	\N	1234567890
45bc5f15-964c-4f27-8734-ec8fe47b9d87	\N	\N	\N	\N	devensurejads@gmail.com	\N	\N	\N	NONE	f	2024-12-24 08:47:57.908	2024-12-24 08:47:57.908	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	170579	\N	\N	\N
795b83c9-ecbf-496b-9efc-0acb6e2864b5	\N	\N	\N	\N	devensureja07@gmail.com	\N	\N	\N	NONE	f	2024-12-31 10:24:36.651	2024-12-31 10:24:36.651	c326e1e2-6f82-4af4-ba25-06029eba658f	t	\N	\N	\N	\N	\N
\.


--
-- TOC entry 4827 (class 2606 OID 76745)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 76797)
-- Name: agencies agencies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agencies
    ADD CONSTRAINT agencies_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 76808)
-- Name: agency_packages agency_packages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_packages
    ADD CONSTRAINT agency_packages_pkey PRIMARY KEY (id);


--
-- TOC entry 4834 (class 2606 OID 76819)
-- Name: cities cities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_pkey PRIMARY KEY (id);


--
-- TOC entry 4875 (class 2606 OID 77216)
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency
    ADD CONSTRAINT currency_pkey PRIMARY KEY (id);


--
-- TOC entry 4870 (class 2606 OID 77081)
-- Name: developers developers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.developers
    ADD CONSTRAINT developers_pkey PRIMARY KEY (id);


--
-- TOC entry 4836 (class 2606 OID 76830)
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- TOC entry 4838 (class 2606 OID 76841)
-- Name: lang_translations lang_translations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lang_translations
    ADD CONSTRAINT lang_translations_pkey PRIMARY KEY (id);


--
-- TOC entry 4840 (class 2606 OID 76852)
-- Name: meta_data meta_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meta_data
    ADD CONSTRAINT meta_data_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 77035)
-- Name: neighborhoods neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);


--
-- TOC entry 4864 (class 2606 OID 77047)
-- Name: project_details project_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4866 (class 2606 OID 77058)
-- Name: project_meta_details project_meta_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_meta_details
    ADD CONSTRAINT project_meta_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4868 (class 2606 OID 77069)
-- Name: project_type_listings project_type_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_type_listings
    ADD CONSTRAINT project_type_listings_pkey PRIMARY KEY (id);


--
-- TOC entry 4842 (class 2606 OID 76864)
-- Name: property_details property_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4844 (class 2606 OID 76875)
-- Name: property_meta_details property_meta_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_meta_details
    ADD CONSTRAINT property_meta_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4846 (class 2606 OID 76886)
-- Name: property_type_listings property_type_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_type_listings
    ADD CONSTRAINT property_type_listings_pkey PRIMARY KEY (id);


--
-- TOC entry 4848 (class 2606 OID 76897)
-- Name: property_types property_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_types
    ADD CONSTRAINT property_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4851 (class 2606 OID 76909)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 4854 (class 2606 OID 76920)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4857 (class 2606 OID 76931)
-- Name: states states_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_pkey PRIMARY KEY (id);


--
-- TOC entry 4860 (class 2606 OID 76943)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4872 (class 1259 OID 77086)
-- Name: _DevelopersToAgencyPackages_AB_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "_DevelopersToAgencyPackages_AB_unique" ON public."_DevelopersToAgencyPackages" USING btree ("A", "B");


--
-- TOC entry 4873 (class 1259 OID 77087)
-- Name: _DevelopersToAgencyPackages_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_DevelopersToAgencyPackages_B_index" ON public."_DevelopersToAgencyPackages" USING btree ("B");


--
-- TOC entry 4830 (class 1259 OID 76944)
-- Name: agencies_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX agencies_user_id_key ON public.agencies USING btree (user_id);


--
-- TOC entry 4876 (class 1259 OID 77217)
-- Name: currency_symbol_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX currency_symbol_key ON public.currency USING btree (symbol);


--
-- TOC entry 4871 (class 1259 OID 77085)
-- Name: developers_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX developers_user_id_key ON public.developers USING btree (user_id);


--
-- TOC entry 4849 (class 1259 OID 76950)
-- Name: roles_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX roles_name_key ON public.roles USING btree (name);


--
-- TOC entry 4852 (class 1259 OID 76951)
-- Name: settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settings_key_key ON public.settings USING btree (key);


--
-- TOC entry 4855 (class 1259 OID 77088)
-- Name: states_lang_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX states_lang_id_key ON public.states USING btree (lang_id);


--
-- TOC entry 4858 (class 1259 OID 76954)
-- Name: users_email_address_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_address_key ON public.users USING btree (email_address);


--
-- TOC entry 4917 (class 2606 OID 77194)
-- Name: _DevelopersToAgencyPackages _DevelopersToAgencyPackages_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DevelopersToAgencyPackages"
    ADD CONSTRAINT "_DevelopersToAgencyPackages_A_fkey" FOREIGN KEY ("A") REFERENCES public.agency_packages(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4918 (class 2606 OID 77199)
-- Name: _DevelopersToAgencyPackages _DevelopersToAgencyPackages_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_DevelopersToAgencyPackages"
    ADD CONSTRAINT "_DevelopersToAgencyPackages_B_fkey" FOREIGN KEY ("B") REFERENCES public.developers(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4877 (class 2606 OID 76955)
-- Name: agencies agencies_agency_packages_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agencies
    ADD CONSTRAINT agencies_agency_packages_fkey FOREIGN KEY (agency_packages) REFERENCES public.agency_packages(id);


--
-- TOC entry 4878 (class 2606 OID 94080)
-- Name: agencies agencies_description_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agencies
    ADD CONSTRAINT agencies_description_fkey FOREIGN KEY (description) REFERENCES public.lang_translations(id);


--
-- TOC entry 4879 (class 2606 OID 76960)
-- Name: agencies agencies_meta_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agencies
    ADD CONSTRAINT agencies_meta_id_fkey FOREIGN KEY (meta_id) REFERENCES public.meta_data(id);


--
-- TOC entry 4880 (class 2606 OID 94085)
-- Name: agencies agencies_service_area_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agencies
    ADD CONSTRAINT agencies_service_area_fkey FOREIGN KEY (service_area) REFERENCES public.lang_translations(id);


--
-- TOC entry 4881 (class 2606 OID 77089)
-- Name: agency_packages agency_packages_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.agency_packages
    ADD CONSTRAINT agency_packages_name_fkey FOREIGN KEY (name) REFERENCES public.lang_translations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4882 (class 2606 OID 77001)
-- Name: cities cities_lang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT cities_lang_id_fkey FOREIGN KEY (lang_id) REFERENCES public.lang_translations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4884 (class 2606 OID 76970)
-- Name: districts city_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT city_foreign_key FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- TOC entry 4886 (class 2606 OID 76975)
-- Name: property_details city_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT city_foreign_key FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- TOC entry 4904 (class 2606 OID 77129)
-- Name: project_details city_project_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT city_project_foreign_key FOREIGN KEY (city_id) REFERENCES public.cities(id);


--
-- TOC entry 4915 (class 2606 OID 98138)
-- Name: developers developers_description_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.developers
    ADD CONSTRAINT developers_description_fkey FOREIGN KEY (description) REFERENCES public.lang_translations(id);


--
-- TOC entry 4916 (class 2606 OID 98143)
-- Name: developers developers_serviceArea_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.developers
    ADD CONSTRAINT "developers_serviceArea_fkey" FOREIGN KEY ("serviceArea") REFERENCES public.lang_translations(id);


--
-- TOC entry 4902 (class 2606 OID 77094)
-- Name: neighborhoods district_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT district_foreign_key FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 4887 (class 2606 OID 76980)
-- Name: property_details districts_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT districts_foreign_key FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 4885 (class 2606 OID 77007)
-- Name: districts districts_lang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_lang_id_fkey FOREIGN KEY (lang_id) REFERENCES public.lang_translations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4905 (class 2606 OID 77134)
-- Name: project_details districts_project_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT districts_project_foreign_key FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 4903 (class 2606 OID 77099)
-- Name: neighborhoods neighborhoods_lang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_lang_id_fkey FOREIGN KEY (lang_id) REFERENCES public.lang_translations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 4906 (class 2606 OID 77233)
-- Name: project_details project_details_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currency(id);


--
-- TOC entry 4907 (class 2606 OID 77139)
-- Name: project_details project_details_description_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_description_fkey FOREIGN KEY (description) REFERENCES public.lang_translations(id);


--
-- TOC entry 4908 (class 2606 OID 77228)
-- Name: project_details project_details_neighborhoods_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_neighborhoods_id_fkey FOREIGN KEY (neighborhoods_id) REFERENCES public.neighborhoods(id);


--
-- TOC entry 4909 (class 2606 OID 77144)
-- Name: project_details project_details_title_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_details_title_fkey FOREIGN KEY (title) REFERENCES public.lang_translations(id);


--
-- TOC entry 4888 (class 2606 OID 77104)
-- Name: property_details project_id_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT project_id_foreign_key FOREIGN KEY (project_id) REFERENCES public.project_details(id);


--
-- TOC entry 4914 (class 2606 OID 77169)
-- Name: project_type_listings project_listing_name_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_type_listings
    ADD CONSTRAINT project_listing_name_foreign_key FOREIGN KEY (name) REFERENCES public.lang_translations(id);


--
-- TOC entry 4912 (class 2606 OID 77159)
-- Name: project_meta_details project_meta_details_project_detail_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_meta_details
    ADD CONSTRAINT project_meta_details_project_detail_id_fkey FOREIGN KEY (project_detail_id) REFERENCES public.project_details(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4913 (class 2606 OID 77164)
-- Name: project_meta_details project_meta_details_project_type_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_meta_details
    ADD CONSTRAINT project_meta_details_project_type_listing_id_fkey FOREIGN KEY (project_type_listing_id) REFERENCES public.project_type_listings(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4910 (class 2606 OID 77149)
-- Name: project_details project_user_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT project_user_foreign_key FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4889 (class 2606 OID 77109)
-- Name: property_details property_descriptioj_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_descriptioj_foreign_key FOREIGN KEY (description) REFERENCES public.lang_translations(id);


--
-- TOC entry 4896 (class 2606 OID 77174)
-- Name: property_meta_details property_detail_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_meta_details
    ADD CONSTRAINT property_detail_foreign_key FOREIGN KEY (property_detail_id) REFERENCES public.property_details(id);


--
-- TOC entry 4890 (class 2606 OID 77218)
-- Name: property_details property_details_currency_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_currency_id_fkey FOREIGN KEY (currency_id) REFERENCES public.currency(id);


--
-- TOC entry 4891 (class 2606 OID 77223)
-- Name: property_details property_details_neighborhoods_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_details_neighborhoods_id_fkey FOREIGN KEY (neighborhoods_id) REFERENCES public.neighborhoods(id);


--
-- TOC entry 4898 (class 2606 OID 77184)
-- Name: property_type_listings property_listing_name_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_type_listings
    ADD CONSTRAINT property_listing_name_foreign_key FOREIGN KEY (name) REFERENCES public.lang_translations(id);


--
-- TOC entry 4892 (class 2606 OID 77114)
-- Name: property_details property_title_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_title_foreign_key FOREIGN KEY (title) REFERENCES public.lang_translations(id);


--
-- TOC entry 4893 (class 2606 OID 77119)
-- Name: property_details property_type_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_type_foreign_key FOREIGN KEY (type) REFERENCES public.property_types(id);


--
-- TOC entry 4897 (class 2606 OID 77179)
-- Name: property_meta_details property_type_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_meta_details
    ADD CONSTRAINT property_type_foreign_key FOREIGN KEY (property_type_id) REFERENCES public.property_type_listings(id);


--
-- TOC entry 4899 (class 2606 OID 77189)
-- Name: property_types property_type_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_types
    ADD CONSTRAINT property_type_foreign_key FOREIGN KEY (title) REFERENCES public.lang_translations(id);


--
-- TOC entry 4894 (class 2606 OID 77124)
-- Name: property_details property_user_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT property_user_foreign_key FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4901 (class 2606 OID 76990)
-- Name: users role_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT role_foreign_key FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- TOC entry 4883 (class 2606 OID 76965)
-- Name: cities state_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cities
    ADD CONSTRAINT state_foreign_key FOREIGN KEY (state_id) REFERENCES public.states(id);


--
-- TOC entry 4895 (class 2606 OID 76985)
-- Name: property_details state_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.property_details
    ADD CONSTRAINT state_foreign_key FOREIGN KEY (state_id) REFERENCES public.states(id);


--
-- TOC entry 4911 (class 2606 OID 77154)
-- Name: project_details state_project_foreign_key; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.project_details
    ADD CONSTRAINT state_project_foreign_key FOREIGN KEY (state_id) REFERENCES public.states(id);


--
-- TOC entry 4900 (class 2606 OID 76995)
-- Name: states states_lang_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT states_lang_id_fkey FOREIGN KEY (lang_id) REFERENCES public.lang_translations(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2025-01-03 15:51:00

--
-- PostgreSQL database dump complete
--

