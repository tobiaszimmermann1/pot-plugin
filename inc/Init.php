<?php

/**
 * @package FoocoopPlugin
 */
namespace Inc;

final class Init
{

  /**
   * Store all the classes inside an array
   */
    public static function get_services()
    {
        return [
            Pages\AdminMembers::class,
            Pages\AdminSettings::class,
            Pages\AdminBestellrunden::class,
            Pages\AdminImport::class,
            Pages\AdminMutations::class,
            Base\Enqueue::class,
            Base\CPTBestellrunden::class,
            Base\ExtendProducts::class,
            Base\OrderMeta::class,
            Base\Import::class,
            Base\ExportDistribution::class,
            Base\ExportDistributionDetail::class,
            Base\ExportData::class,
            Base\ExportReceipts::class,
            Base\MutationDelete::class,
            Base\MutationPrice::class,
            Payments\WalletDashboard::class,
            Output\OrderList::class,
            Output\OrderFilter::class,
            Output\Cart::class
        ];
    }

    /**
     * Loop through the classes, initialize them and call register() method if it exists
     */
    public static function register_services()
    {
        foreach (self::get_services() as $class) {
            $service = self::instantiate($class);
            if (method_exists($service, 'register')) {
                $service->register();
            }
        }
    }
  
    /**
     *  Initialize the class
     */
    private static function instantiate($class)
    {
        return new $class();
    }
}
