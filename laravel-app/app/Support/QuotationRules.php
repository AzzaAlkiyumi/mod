<?php

namespace App\Support;

/** Quotation status workflow and edit/delete permissions — ported from
 * lib/quotation-rules.ts. */
class QuotationRules
{
    public const STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED'];

    private const ALLOWED_TRANSITIONS = [
        'DRAFT' => ['SENT'],
        'SENT' => ['ACCEPTED', 'REJECTED', 'EXPIRED'],
        'ACCEPTED' => ['CONVERTED'],
        'REJECTED' => [],
        'EXPIRED' => [],
        'CONVERTED' => [],
    ];

    public static function canTransition(string $from, string $to): bool
    {
        if ($from === $to) {
            return true;
        }

        return in_array($to, self::ALLOWED_TRANSITIONS[$from] ?? [], true);
    }

    public static function isEditable(string $status): bool
    {
        return in_array($status, ['DRAFT', 'SENT'], true);
    }

    public static function isDeletable(string $status): bool
    {
        return $status !== 'CONVERTED';
    }

    public static function isConvertible(string $status): bool
    {
        return $status === 'ACCEPTED';
    }
}
