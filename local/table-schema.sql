START TRANSACTION;

DROP TABLE IF EXISTS `user_role`;
DROP TABLE IF EXISTS `user`;
DROP TABLE IF EXISTS `role_permission`;
DROP TABLE IF EXISTS `role`;
DROP TABLE IF EXISTS `permission`;
DROP TABLE IF EXISTS `user_role`;
DROP TABLE IF EXISTS `company`;

CREATE TABLE `company` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

CREATE TABLE `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(200) NOT NULL,
  `first_name` VARCHAR(200),
  `last_name` VARCHAR(200),
  `cognito_id` VARCHAR(200) NOT NULL,
  `company_id` bigint(20) unsigned NOT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`company_id`) REFERENCES company(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

CREATE TABLE `role` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `company_id` bigint(20) unsigned NOT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`company_id`) REFERENCES company(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

CREATE TABLE `user_role` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`user_id`) REFERENCES user(`id`),
  FOREIGN KEY(`role_id`) REFERENCES role(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

CREATE TABLE `permission` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

CREATE TABLE `role_permission` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `permission_id` bigint(20) unsigned NOT NULL,
  `role_id` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`permission_id`) REFERENCES permission(`id`),
  FOREIGN KEY(`role_id`) REFERENCES role(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

INSERT INTO `company`(name) VALUES ('Template');

INSERT INTO `role`(name, company_id) VALUES ('Admin', LAST_INSERT_ID());

SET @role_id = LAST_INSERT_ID();

INSERT INTO `permission`(name) VALUES ('getUsers');
INSERT INTO `role_permission`(permission_id, role_id) VALUES (LAST_INSERT_ID(), @role_id);

INSERT INTO `permission`(name) VALUES ('getCompanies');
INSERT INTO `role_permission`(permission_id, role_id) VALUES (LAST_INSERT_ID(), @role_id);

COMMIT;


----------------------

START TRANSACTION;

DROP TABLE IF EXISTS `landing_page`;
CREATE TABLE `landing_page` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL,
  `unique_name` VARCHAR(200) NOT NULL,
  `company_id` bigint(20) unsigned NOT NULL,
  `cta` VARCHAR(50) NOT NULL,
  `title_prompt` VARCHAR(500) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content_prompt` VARCHAR(500) NOT NULL,
  `content` TEXT NOT NULL,
  `video` VARCHAR(500) NOT NULL,
  `color` VARCHAR(15) NOT NULL,
  `created` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY(`company_id`) REFERENCES company(`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_bin;

COMMIT;
