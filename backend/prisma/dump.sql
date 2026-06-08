--
-- PostgreSQL database dump
--

\restrict neFRBifHveAElBqVAdz1sGffUgRP7WBQZ8aMYcsqhRfYfCPCCQZsuMZHdj3dhue

-- Dumped from database version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

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
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'TRANSFER'
);


--
-- Name: PurchaseStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PurchaseStatus" AS ENUM (
    'PENDING',
    'RECEIVED',
    'CANCELLED'
);


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'MANAGER',
    'CASHIER',
    'STAFF'
);


--
-- Name: StockMovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."StockMovementType" AS ENUM (
    'IN',
    'OUT',
    'ADJUST'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    address text,
    points integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.employees (
    id integer NOT NULL,
    full_name text NOT NULL,
    phone text,
    address text,
    "position" text,
    salary numeric(12,2),
    hired_at timestamp(3) without time zone,
    user_id integer,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL
);


--
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    code text NOT NULL,
    customer_id integer,
    employee_id integer,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    final_amount numeric(12,2) DEFAULT 0 NOT NULL,
    payment_method public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    status public."OrderStatus" DEFAULT 'COMPLETED'::public."OrderStatus" NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id integer NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    category_id integer,
    sale_price numeric(12,2) DEFAULT 0 NOT NULL,
    cost_price numeric(12,2) DEFAULT 0 NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    min_stock integer DEFAULT 0 NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    purchase_order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    unit_cost numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL
);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    code text NOT NULL,
    supplier_id integer,
    employee_id integer,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    status public."PurchaseStatus" DEFAULT 'RECEIVED'::public."PurchaseStatus" NOT NULL,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    product_id integer NOT NULL,
    type public."StockMovementType" NOT NULL,
    quantity integer NOT NULL,
    reference_type text,
    reference_id integer,
    note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name text NOT NULL,
    phone text,
    email text,
    address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    email text,
    password_hash text NOT NULL,
    role public."Role" DEFAULT 'STAFF'::public."Role" NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public._prisma_migrations VALUES ('c7315d6a-2908-4d24-bd44-ba4bb2a8a31f', '9804a6768f92db7cbd20d1dd16a2a0547a3962ba4c33f5f085c18f2dfb39764c', '2026-06-08 14:53:29.16533+07', '20260608075328_init', NULL, NULL, '2026-06-08 14:53:28.912133+07', 1);


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories VALUES (3, 'Banh kem', NULL, '2026-06-08 08:29:45.022', '2026-06-08 08:29:45.022');
INSERT INTO public.categories VALUES (4, 'Banh mi', NULL, '2026-06-08 08:29:45.024', '2026-06-08 08:29:45.024');
INSERT INTO public.categories VALUES (5, 'Banh ngot', NULL, '2026-06-08 08:29:45.026', '2026-06-08 08:29:45.026');
INSERT INTO public.categories VALUES (6, 'Banh quy', NULL, '2026-06-08 08:29:45.027', '2026-06-08 08:29:45.027');
INSERT INTO public.categories VALUES (7, 'Do uong', NULL, '2026-06-08 08:29:45.029', '2026-06-08 08:29:45.029');


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.customers VALUES (1, 'Nguyen Van An', '0911111111', NULL, NULL, 120, '2026-06-08 08:29:45.096', '2026-06-08 08:29:45.096');
INSERT INTO public.customers VALUES (2, 'Tran Thi Binh', '0922222222', NULL, NULL, 50, '2026-06-08 08:29:45.103', '2026-06-08 08:29:45.103');
INSERT INTO public.customers VALUES (3, 'Le Hoang Cuong', '0933333333', NULL, NULL, 0, '2026-06-08 08:29:45.105', '2026-06-08 08:29:45.105');
INSERT INTO public.customers VALUES (4, 'Pham Thi Dung', '0944444444', 'dung.pham@gmail.com', NULL, 300, '2026-06-08 08:29:45.106', '2026-06-08 08:29:45.106');


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.employees VALUES (2, 'Quan Tri Vien', '0900000000', NULL, 'Admin', NULL, NULL, 2, '2026-06-08 08:29:45', '2026-06-08 08:29:45');
INSERT INTO public.employees VALUES (3, 'Tran Quan Ly', '0900000001', NULL, 'Quan ly cua hang', 15000000.00, NULL, 3, '2026-06-08 08:29:45.012', '2026-06-08 08:29:45.012');
INSERT INTO public.employees VALUES (4, 'Le Thu Ngan', '0900000002', NULL, 'Thu ngan', 8000000.00, NULL, 4, '2026-06-08 08:29:45.015', '2026-06-08 08:29:45.015');
INSERT INTO public.employees VALUES (5, 'Pham Nhan Vien', '0900000003', NULL, 'Nhan vien ban hang', 7000000.00, NULL, 5, '2026-06-08 08:29:45.019', '2026-06-08 08:29:45.019');


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_items VALUES (1, 1, 3, 1, 250000.00, 250000.00);
INSERT INTO public.order_items VALUES (2, 1, 6, 2, 20000.00, 40000.00);
INSERT INTO public.order_items VALUES (3, 2, 9, 3, 35000.00, 105000.00);
INSERT INTO public.order_items VALUES (4, 2, 13, 2, 30000.00, 60000.00);
INSERT INTO public.order_items VALUES (5, 3, 11, 1, 50000.00, 50000.00);


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orders VALUES (1, 'HD0001', 1, 4, 290000.00, 0.00, 290000.00, 'CASH', 'COMPLETED', NULL, '2026-06-08 08:29:45.117');
INSERT INTO public.orders VALUES (2, 'HD0002', 4, 4, 165000.00, 0.00, 165000.00, 'TRANSFER', 'COMPLETED', NULL, '2026-06-08 08:29:45.136');
INSERT INTO public.orders VALUES (3, 'HD0003', NULL, 4, 50000.00, 0.00, 50000.00, 'CARD', 'COMPLETED', NULL, '2026-06-08 08:29:45.153');


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products VALUES (3, 'BK001', 'Banh kem dau', 3, 250000.00, 150000.00, 12, 3, NULL, true, '2026-06-08 08:29:45.031', '2026-06-08 08:29:45.031');
INSERT INTO public.products VALUES (4, 'BK002', 'Banh kem socola', 3, 280000.00, 160000.00, 8, 3, NULL, true, '2026-06-08 08:29:45.039', '2026-06-08 08:29:45.039');
INSERT INTO public.products VALUES (5, 'BK003', 'Banh kem trai cay', 3, 320000.00, 190000.00, 5, 2, NULL, true, '2026-06-08 08:29:45.046', '2026-06-08 08:29:45.046');
INSERT INTO public.products VALUES (6, 'BM001', 'Banh mi thit', 4, 20000.00, 10000.00, 60, 15, NULL, true, '2026-06-08 08:29:45.054', '2026-06-08 08:29:45.054');
INSERT INTO public.products VALUES (7, 'BM002', 'Banh mi pate', 4, 18000.00, 9000.00, 45, 15, NULL, true, '2026-06-08 08:29:45.062', '2026-06-08 08:29:45.062');
INSERT INTO public.products VALUES (8, 'BN001', 'Banh su kem', 5, 15000.00, 7000.00, 40, 10, NULL, true, '2026-06-08 08:29:45.064', '2026-06-08 08:29:45.064');
INSERT INTO public.products VALUES (9, 'BN002', 'Banh tiramisu', 5, 35000.00, 20000.00, 25, 8, NULL, true, '2026-06-08 08:29:45.065', '2026-06-08 08:29:45.065');
INSERT INTO public.products VALUES (10, 'BN003', 'Banh croissant', 5, 25000.00, 12000.00, 30, 10, NULL, true, '2026-06-08 08:29:45.067', '2026-06-08 08:29:45.067');
INSERT INTO public.products VALUES (11, 'BQ001', 'Banh quy bo (hop)', 6, 50000.00, 30000.00, 20, 5, NULL, true, '2026-06-08 08:29:45.069', '2026-06-08 08:29:45.069');
INSERT INTO public.products VALUES (12, 'BQ002', 'Cookie socola (hop)', 6, 60000.00, 35000.00, 18, 5, NULL, true, '2026-06-08 08:29:45.07', '2026-06-08 08:29:45.07');
INSERT INTO public.products VALUES (13, 'DU001', 'Tra sua tran chau', 7, 30000.00, 12000.00, 50, 10, NULL, true, '2026-06-08 08:29:45.072', '2026-06-08 08:29:45.072');
INSERT INTO public.products VALUES (14, 'DU002', 'Ca phe sua da', 7, 25000.00, 8000.00, 50, 10, NULL, true, '2026-06-08 08:29:45.074', '2026-06-08 08:29:45.074');


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_order_items VALUES (1, 1, 6, 50, 10000.00, 500000.00);
INSERT INTO public.purchase_order_items VALUES (2, 1, 8, 40, 7000.00, 280000.00);
INSERT INTO public.purchase_order_items VALUES (3, 1, 13, 50, 12000.00, 600000.00);


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.purchase_orders VALUES (1, 'PN0001', 1, 3, 1380000.00, 'RECEIVED', 'Nhap hang dau ky', '2026-06-08 08:29:45.108');


--
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.stock_movements VALUES (1, 6, 'IN', 50, 'PURCHASE', 1, 'Nhap tu phieu PN0001', '2026-06-08 08:29:45.112');
INSERT INTO public.stock_movements VALUES (2, 8, 'IN', 40, 'PURCHASE', 1, 'Nhap tu phieu PN0001', '2026-06-08 08:29:45.114');
INSERT INTO public.stock_movements VALUES (3, 13, 'IN', 50, 'PURCHASE', 1, 'Nhap tu phieu PN0001', '2026-06-08 08:29:45.115');
INSERT INTO public.stock_movements VALUES (4, 3, 'OUT', 1, 'ORDER', 1, 'Ban theo don HD0001', '2026-06-08 08:29:45.122');
INSERT INTO public.stock_movements VALUES (5, 6, 'OUT', 2, 'ORDER', 1, 'Ban theo don HD0001', '2026-06-08 08:29:45.129');
INSERT INTO public.stock_movements VALUES (6, 9, 'OUT', 3, 'ORDER', 2, 'Ban theo don HD0002', '2026-06-08 08:29:45.145');
INSERT INTO public.stock_movements VALUES (7, 13, 'OUT', 2, 'ORDER', 2, 'Ban theo don HD0002', '2026-06-08 08:29:45.151');
INSERT INTO public.stock_movements VALUES (8, 11, 'OUT', 1, 'ORDER', 3, 'Ban theo don HD0003', '2026-06-08 08:29:45.157');


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.suppliers VALUES (1, 'Cong ty Bot Mi Binh Dong', '0281234567', 'sales@botmibd.vn', 'Quan 8, TP.HCM', '2026-06-08 08:29:45.075', '2026-06-08 08:29:45.075');
INSERT INTO public.suppliers VALUES (2, 'NPP Bo Sua ABC', '0282345678', 'order@abcdairy.vn', 'Quan 7, TP.HCM', '2026-06-08 08:29:45.083', '2026-06-08 08:29:45.083');
INSERT INTO public.suppliers VALUES (3, 'Dai ly Nguyen Lieu Huong Viet', '0283456789', 'huongviet@gmail.com', 'Thu Duc, TP.HCM', '2026-06-08 08:29:45.09', '2026-06-08 08:29:45.09');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users VALUES (2, 'admin', 'admin@banbanh.local', '$2a$10$.cE46sJ3P2aPxn76trd41uPIRVglJm1./4EkvI8tSBpK/Whq6hMv.', 'ADMIN', true, '2026-06-08 08:29:45', '2026-06-08 08:29:45');
INSERT INTO public.users VALUES (3, 'manager', NULL, '$2a$10$MRxx35f3gc3qtYdsrvJXp.A8r2.8QOqMm4PiOicnEcrjp7geefyRq', 'MANAGER', true, '2026-06-08 08:29:45.012', '2026-06-08 08:29:45.012');
INSERT INTO public.users VALUES (4, 'cashier', NULL, '$2a$10$MRxx35f3gc3qtYdsrvJXp.A8r2.8QOqMm4PiOicnEcrjp7geefyRq', 'CASHIER', true, '2026-06-08 08:29:45.015', '2026-06-08 08:29:45.015');
INSERT INTO public.users VALUES (5, 'staff', NULL, '$2a$10$MRxx35f3gc3qtYdsrvJXp.A8r2.8QOqMm4PiOicnEcrjp7geefyRq', 'STAFF', true, '2026-06-08 08:29:45.019', '2026-06-08 08:29:45.019');


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.categories_id_seq', 7, true);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.customers_id_seq', 4, true);


--
-- Name: employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.employees_id_seq', 5, true);


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.order_items_id_seq', 5, true);


--
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.orders_id_seq', 3, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.products_id_seq', 14, true);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 3, true);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 1, true);


--
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 8, true);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: categories_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX categories_name_key ON public.categories USING btree (name);


--
-- Name: customers_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX customers_phone_key ON public.customers USING btree (phone);


--
-- Name: employees_user_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX employees_user_id_key ON public.employees USING btree (user_id);


--
-- Name: orders_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX orders_code_key ON public.orders USING btree (code);


--
-- Name: products_sku_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX products_sku_key ON public.products USING btree (sku);


--
-- Name: purchase_orders_code_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX purchase_orders_code_key ON public.purchase_orders USING btree (code);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);


--
-- Name: employees employees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: orders orders_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: purchase_order_items purchase_order_items_purchase_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_purchase_order_id_fkey FOREIGN KEY (purchase_order_id) REFERENCES public.purchase_orders(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: purchase_orders purchase_orders_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: purchase_orders purchase_orders_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict neFRBifHveAElBqVAdz1sGffUgRP7WBQZ8aMYcsqhRfYfCPCCQZsuMZHdj3dhue

