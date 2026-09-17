<?php

declare(strict_types=1);

namespace Drupal\imagine_custom;

use Drupal\ckeditor5\HTMLRestrictions;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Config\ConfigFactoryOverrideInterface;
use Drupal\Core\Config\StorageInterface;

/**
 * Widens filter_html so the classes injected into CKEditor 5 survive render.
 *
 * The text format itself is shared, managed config that this site may not
 * modify, so the extra attributes are layered on at runtime instead. This
 * override is inert when filter_html is disabled on the format.
 */
class ImagineFilterOverrides implements ConfigFactoryOverrideInterface {

  protected const FORMAT_CONFIG = 'filter.format.folwell_ckeditor';

  /**
   * Extra tags/attributes required by imagine_custom_editor_js_settings_alter().
   *
   * Keep this in sync with the style definitions and link decorators in
   * imagine_custom.module.
   */
  protected const EXTRA_TAGS = '<p class="badge muted-text small-maroon-text small-caps"> <a class="imagine-btn">';

  public function __construct(protected StorageInterface $configStorage) {}

  /**
   * {@inheritdoc}
   */
  public function loadOverrides($names) {
    $overrides = [];

    if (!in_array(static::FORMAT_CONFIG, $names, TRUE)) {
      return $overrides;
    }

    // Read from raw storage. Going through the config factory here would
    // recurse back into this override and blow the stack.
    $data = $this->configStorage->read(static::FORMAT_CONFIG);

    // If "Limit allowed HTML tags" is off, there is nothing to widen.
    if (empty($data['filters']['filter_html']['status'])) {
      return $overrides;
    }

    $current = $data['filters']['filter_html']['settings']['allowed_html'] ?? '';

    // merge() unions the allowed *values* per attribute, so an existing
    // <p class="text-align-center"> keeps its class rather than being
    // overwritten. Do not concatenate the strings by hand -- duplicate tags
    // in allowed_html silently clobber each other.
    $merged = HTMLRestrictions::fromString($current)
      ->merge(HTMLRestrictions::fromString(static::EXTRA_TAGS))
      ->toFilterHtmlAllowedTagsString();

    $overrides[static::FORMAT_CONFIG]['filters']['filter_html']['settings']['allowed_html'] = $merged;

    return $overrides;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheSuffix() {
    return 'imagine_custom';
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata($name) {
    return new CacheableMetadata();
  }

  /**
   * {@inheritdoc}
   */
  public function createConfigObject($name, $collection = StorageInterface::DEFAULT_COLLECTION) {
    return NULL;
  }

}
